'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { SocialNavigation } from '@/components/social-navigation';
import { Bookmark, Briefcase, ClipboardCheck, Heart, ImagePlus, MapPin, MessageCircle, Pencil, Send, Share2, Sparkles, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';
import { authClient } from '@/lib/auth-client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

type Person = { id: string; name?: string | null; image?: string | null; avatar?: string | null; artisan?: { id?: string; profession?: string | null } };
type Comment = { id: string; content: string; createdAt: string; author: Person };
type Post = {
  id: string; content: string; title?: string | null; category?: string | null; location?: string | null;
  mediaUrls: string[]; mediaTypes: string[]; createdAt: string; author: Person;
  comments: Comment[]; reactions: { userId: string }[]; _count: { comments: number; reactions: number }; reacted: boolean;
};

function nameOf(person?: Person) { return person?.name || 'Utilisateur'; }
function initials(person?: Person) { return nameOf(person).split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'U'; }

export default function SocialPage() {
  const { data: session } = authClient.useSession();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [composer, setComposer] = useState(false);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [media, setMedia] = useState<string[]>([]);
  const [mediaTypes, setMediaTypes] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [search, setSearch] = useState('');
  const [savedOnly, setSavedOnly] = useState(false);
  const [suggestedArtisans, setSuggestedArtisans] = useState<any[]>([]);
  const [artisanResults, setArtisanResults] = useState<any[]>([]);
  const [searchingArtisans, setSearchingArtisans] = useState(false);
  const [favoriteArtisanIds, setFavoriteArtisanIds] = useState<Set<string>>(new Set());
  const [savedPostIds, setSavedPostIds] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState('Toutes');

  async function loadPosts(query = '') {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set('q', query.trim());
      const response = await fetch(`/api/social/posts${params.size ? `?${params}` : ''}`, { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setPosts(data.posts || []);
    } catch (error: any) { toast.error(error.message || 'Impossible de charger les publications'); }
    finally { setLoading(false); }
  }

  useEffect(() => { const timer = window.setTimeout(() => void loadPosts(search), 250); return () => window.clearTimeout(timer); }, [search]);
  useEffect(() => {
    if (!search.trim()) {
      setArtisanResults([]);
      setSearchingArtisans(false);
      return;
    }
    const timer = window.setTimeout(async () => {
      setSearchingArtisans(true);
      try {
        const response = await fetch(`/api/artisans/search?q=${encodeURIComponent(search.trim())}`, { cache: 'no-store' });
        const data = await response.json();
        setArtisanResults(response.ok ? data.artisans || [] : []);
      } catch { setArtisanResults([]); }
      finally { setSearchingArtisans(false); }
    }, 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetch('/api/artisans?limit=5', { cache: 'no-store' })
      .then((response) => response.ok ? response.json() : { artisans: [] })
      .then((data) => setSuggestedArtisans(data.artisans || []))
      .catch(() => setSuggestedArtisans([]));
  }, []);

  useEffect(() => {
    if (!session?.user?.id) return;
    fetch('/api/favorites', { cache: 'no-store' })
      .then((response) => response.ok ? response.json() : { favorites: [] })
      .then((data) => setFavoriteArtisanIds(new Set((data.favorites || []).map((favorite: any) => favorite.artisanId))))
      .catch(() => setFavoriteArtisanIds(new Set()));
  }, [session?.user?.id]);

  useEffect(() => {
    if (!session?.user?.id) return;
    fetch('/api/social/saved', { cache: 'no-store', credentials: 'include' })
      .then((response) => response.ok ? response.json() : { postIds: [] })
      .then((data) => setSavedPostIds(new Set(data.postIds || [])))
      .catch(() => setSavedPostIds(new Set()));
  }, [session?.user?.id]);

  async function toggleSavedPost(postId: string) {
    if (!session?.user?.id) return toast.info('Connectez-vous pour enregistrer une publication');
    const remove = savedPostIds.has(postId);
    const response = await fetch(remove ? `/api/social/saved?postId=${encodeURIComponent(postId)}` : '/api/social/saved', { method: remove ? 'DELETE' : 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, ...(remove ? {} : { body: JSON.stringify({ postId }) }) });
    if (!response.ok) return toast.error('Impossible de modifier cette publication enregistrée');
    setSavedPostIds((current) => { const next = new Set(current); if (remove) next.delete(postId); else next.add(postId); return next; });
    toast.success(remove ? 'Publication retirée des favoris' : 'Publication enregistrée');
  }

  async function toggleFavorite(artisanId: string) {
    if (!session?.user?.id) { toast.info('Connectez-vous pour suivre un artisan'); return; }
    const response = await fetch('/api/favorites', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ artisanId }) });
    const data = await response.json();
    if (!response.ok) return toast.error(data.error || 'Action impossible');
    setFavoriteArtisanIds((current) => {
      const next = new Set(current);
      if (data.favorited) next.add(artisanId); else next.delete(artisanId);
      return next;
    });
    toast.success(data.favorited ? 'Artisan suivi' : 'Suivi retiré');
  }

  async function uploadPhoto(file: File) {
    if (media.length >= 4) return toast.error('Maximum 4 photos');
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('type', file.type.startsWith('video/') ? 'social-video' : 'portfolio');
      const response = await fetch('/api/upload', { method: 'POST', body: form });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Échec du téléversement');
      setMedia((items) => [...items, data.url]);
      setMediaTypes((items) => [...items, file.type.startsWith('video/') ? 'video' : 'image']);
    } catch (error: any) { toast.error(error.message); }
    finally { setUploading(false); }
  }

  async function publish(event: FormEvent) {
    event.preventDefault();
    if (!session?.user?.id) return toast.error('Connectez-vous pour publier');
    if (!content.trim() && media.length === 0) return toast.error('Ajoutez du texte ou une photo');
    setPublishing(true);
    try {
      const response = await fetch('/api/social/posts', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content, title, category, location, mediaUrls: media, mediaTypes }) });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || 'Publication impossible. Veuillez réessayer.');
      if (!data?.post) throw new Error('La publication n’a pas été enregistrée');
      setPosts((items) => [data.post, ...items]);
      setContent(''); setTitle(''); setCategory(''); setLocation(''); setMedia([]); setMediaTypes([]); setComposer(false);
      toast.success('Publication ajoutée');
    } catch (error: any) { toast.error(error.message || 'Publication impossible'); }
    finally { setPublishing(false); }
  }

  async function toggleReaction(post: Post) {
    if (!session?.user?.id) { toast.info('Connectez-vous pour réagir'); return; }
    const method = post.reacted ? 'DELETE' : 'POST';
    const response = await fetch(`/api/social/posts/${post.id}/reactions`, { method });
    if (!response.ok) return toast.error('Réaction impossible');
    setPosts((items) => items.map((item) => item.id === post.id ? { ...item, reacted: !item.reacted, _count: { ...item._count, reactions: item._count.reactions + (item.reacted ? -1 : 1) }, reactions: item.reacted ? item.reactions.filter((reaction) => reaction.userId !== session.user.id) : [...item.reactions, { userId: session.user.id }] } : item));
  }

  async function addComment(postId: string, value: string) {
    if (!value.trim()) return;
    const response = await fetch(`/api/social/posts/${postId}/comments`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: value }) });
    const data = await response.json();
    if (!response.ok) { toast.error(data.error || 'Commentaire impossible'); return; }
    setPosts((items) => items.map((item) => item.id === postId ? { ...item, comments: [...item.comments, data.comment], _count: { ...item._count, comments: item._count.comments + 1 } } : item));
  }

  async function deletePost(postId: string) {
    if (!confirm('Supprimer cette publication ?')) return;
    const response = await fetch(`/api/social/posts/${postId}`, { method: 'DELETE' });
    if (!response.ok) { toast.error('Suppression impossible'); return; }
    setPosts((items) => items.filter((item) => item.id !== postId));
    toast.success('Publication supprimée');
  }

  const categories = ['Toutes', ...Array.from(new Set(posts.map((post) => post.category).filter((category): category is string => Boolean(category))))].slice(0, 8);
  const visiblePosts = posts.filter((post) => (!savedOnly || savedPostIds.has(post.id)) && (selectedCategory === 'Toutes' || post.category === selectedCategory));

  return (
    <main className="min-h-screen bg-[#fffaf4] dark:bg-slate-950">
      <SocialNavigation search={search} onSearchChange={setSearch} />
      <div className="mx-auto grid max-w-6xl gap-5 px-3 py-5 sm:px-5 lg:grid-cols-[220px_minmax(0,620px)_280px] lg:justify-center">
        <aside className="hidden lg:block">
          <Card className="sticky top-24 overflow-hidden rounded-2xl border-brand-100 shadow-sm">
            <div className="h-16 bg-gradient-to-r from-brand-500 to-orange-400" />
            <div className="px-4 pb-4 text-center">
              <Avatar className="mx-auto -mt-8 h-16 w-16 border-4 border-white"><AvatarImage src={session?.user?.image || undefined} /><AvatarFallback>{initials({ id: session?.user?.id || '', name: session?.user?.name })}</AvatarFallback></Avatar>
              <p className="mt-2 font-semibold text-slate-900">{session?.user?.name || 'Bienvenue sur Finda'}</p>
              <p className="mt-1 text-xs text-slate-500">Professionnel, communauté et réalisations</p>
              <Link href="/dashboard" className="mt-3 inline-flex items-center gap-2 rounded-lg bg-brand-50 px-3 py-2 text-sm font-semibold text-brand-700"><Briefcase className="h-4 w-4" /> Mon tableau de bord</Link>
            </div>
          </Card>
        </aside>

        <div className="min-w-0">

        {posts.length > 0 && <div className="mb-4 flex gap-3 overflow-x-auto pb-2">{posts.slice(0, 8).map((post) => <button key={post.id} onClick={() => document.getElementById(`post-${post.id}`)?.scrollIntoView({ behavior: 'smooth' })} className="shrink-0 text-center"><span className="mx-auto block h-16 w-16 rounded-full bg-gradient-to-br from-brand-400 via-orange-400 to-pink-500 p-[3px]"><span className="block h-full w-full rounded-full border-2 border-white bg-white p-[2px] overflow-hidden"><Avatar className="h-full w-full"><AvatarImage src={post.author.image || post.author.avatar || undefined} /><AvatarFallback>{initials(post.author)}</AvatarFallback></Avatar></span></span><span className="mt-1 block max-w-16 truncate text-[11px] font-medium">{nameOf(post.author)}</span></button>)}</div>}

        {session?.user?.id && !composer && (
          <Card className="mb-4 rounded-2xl border-brand-100 p-3 shadow-sm sm:p-4">
            <button className="flex w-full items-center gap-3 text-left" onClick={() => setComposer(true)}>
              <Avatar className="h-11 w-11 shrink-0"><AvatarImage src={session?.user?.image || undefined} /><AvatarFallback>{initials({ id: session?.user?.id || '', name: session?.user?.name })}</AvatarFallback></Avatar>
              <span className="flex-1 rounded-full border bg-slate-50 px-4 py-3 text-sm text-slate-500 transition hover:bg-white hover:ring-2 hover:ring-brand-100">Présentez une réalisation, une photo ou une astuce…</span>
              <span className="hidden rounded-full bg-brand-50 p-2 text-brand-700 sm:block"><ImagePlus className="h-5 w-5" /></span>
            </button>
          </Card>
        )}

        {composer && (
          <Card className="mb-4 p-4">
            <form onSubmit={publish} className="space-y-3">
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titre de la réalisation (optionnel)" maxLength={120} />
              <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Décrivez le travail réalisé, les matériaux ou le résultat…" rows={4} maxLength={5000} />
              <div className="grid gap-3 sm:grid-cols-2">
                <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Métier / prestation" maxLength={80} />
                <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Zone d'intervention" maxLength={120} />
              </div>
              {media.length > 0 && <div className="grid grid-cols-2 gap-2">{media.map((url, index) => mediaTypes[index] === 'video' ? <video key={url} src={url} controls className="h-36 w-full rounded-xl bg-black object-cover" /> : <img key={url} src={url} alt="Publication" className="h-36 w-full rounded-xl object-cover" />)}</div>}
              <div className="flex flex-wrap items-center gap-2">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-slate-50">
                  <ImagePlus className="h-4 w-4" /> {uploading ? 'Téléversement…' : 'Ajouter une photo'}
                  <input className="hidden" type="file" accept="image/jpeg,image/png,image/webp,video/mp4,video/webm" onChange={(e) => e.target.files?.[0] && uploadPhoto(e.target.files[0])} disabled={uploading} />
                </label>
                <Button type="button" variant="outline" onClick={() => setComposer(false)}>Annuler</Button>
                <Button type="submit" disabled={publishing || uploading} className="ml-auto bg-brand-600 hover:bg-brand-700">{publishing ? 'Publication…' : 'Publier'}</Button>
              </div>
            </form>
          </Card>
        )}

        {search.trim() && (
          <Card className="mb-4 overflow-hidden rounded-2xl border-brand-100 p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="font-semibold text-slate-900">Artisans trouvés</div>
              <Link href={`/search?q=${encodeURIComponent(search.trim())}`} className="text-xs font-semibold text-brand-700 hover:underline">Recherche complète</Link>
            </div>
            {searchingArtisans ? <p className="mt-3 text-sm text-slate-500">Recherche des artisans…</p> : artisanResults.length === 0 ? <p className="mt-3 text-sm text-slate-500">Aucun artisan ne correspond à cette recherche.</p> : (
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {artisanResults.slice(0, 6).map((artisan) => (
                  <div key={artisan.id} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-3">
                    <Avatar className="h-11 w-11 shrink-0"><AvatarImage src={artisan.user?.avatar || artisan.user?.image || undefined} /><AvatarFallback>{initials({ id: artisan.id, name: artisan.user?.name })}</AvatarFallback></Avatar>
                    <Link href={`/artisan/${artisan.id}`} className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-slate-900">{artisan.user?.name || 'Artisan'}</span>
                      <span className="block truncate text-xs text-slate-500">{artisan.profession || 'Artisan professionnel'} · {artisan.location || 'Localisation indisponible'}</span>
                    </Link>
                    <button type="button" onClick={() => void toggleFavorite(artisan.id)} className={`shrink-0 rounded-full px-2.5 py-1.5 text-xs font-semibold ${favoriteArtisanIds.has(artisan.id) ? 'bg-slate-100 text-slate-600' : 'bg-brand-600 text-white'}`}>{favoriteArtisanIds.has(artisan.id) ? 'Suivi' : 'Suivre'}</button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        <Card className="mb-3 overflow-hidden rounded-2xl border-0 bg-gradient-to-r from-brand-700 via-brand-600 to-emerald-500 text-white shadow-lg">
          <div className="flex items-center gap-3 p-4 sm:p-5">
            <div className="rounded-full bg-white/15 p-2.5"><Sparkles className="h-5 w-5" /></div>
            <div className="min-w-0 flex-1"><p className="text-sm font-bold sm:text-base">Votre savoir-faire mérite d’être vu</p><p className="mt-0.5 text-xs text-white/80 sm:text-sm">Avant/après, conseils et réalisations peuvent inspirer toute la communauté.</p></div>
            <Button type="button" onClick={() => setComposer(true)} variant="secondary" className="shrink-0 bg-white text-brand-700 hover:bg-white/90">Partager</Button>
          </div>
        </Card>
        <div className="mb-3 flex items-center gap-2 overflow-x-auto pb-1">
          <button type="button" onClick={() => setSavedOnly(false)} className={`shrink-0 rounded-full px-3.5 py-2 text-xs font-semibold transition ${!savedOnly ? 'bg-brand-600 text-white shadow-sm' : 'border bg-white text-slate-600 hover:bg-slate-50'}`}>Toutes les publications</button>
          <button type="button" onClick={() => setSavedOnly(true)} className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition ${savedOnly ? 'bg-brand-600 text-white shadow-sm' : 'border bg-white text-slate-600 hover:bg-slate-50'}`}><Bookmark className="h-3.5 w-3.5" /> Enregistrées <span className="rounded-full bg-white/20 px-1.5">{savedPostIds.size}</span></button>
        </div>
        {!savedOnly && <div className="mb-4 flex gap-2 overflow-x-auto pb-1" aria-label="Filtrer par métier">{categories.map((categoryName) => <button key={categoryName} type="button" onClick={() => setSelectedCategory(categoryName)} className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${selectedCategory === categoryName ? 'border-brand-600 bg-brand-50 text-brand-700' : 'bg-white text-slate-500 hover:border-brand-200'}`}>{categoryName}</button>)}</div>}

        {loading ? <div className="space-y-4">{[1,2].map((value) => <Card key={value} className="h-52 animate-pulse bg-slate-100" />)}</div> : visiblePosts.length === 0 ? (
          <Card className="p-10 text-center">
            <Bookmark className="mx-auto mb-3 h-10 w-10 text-brand-300" />
            <h1 className="text-xl font-bold text-slate-900">{savedOnly ? 'Aucune publication enregistrée' : 'Aucune réalisation publiée'}</h1>
            <p className="mt-2 text-sm text-slate-500">{savedOnly ? 'Touchez l’icône Enregistrer sous une publication pour la retrouver ici.' : 'Partagez votre savoir-faire et les réalisations de la communauté.'}</p>
          </Card>
        ) : visiblePosts.map((post) => <div key={post.id} id={`post-${post.id}`}><PostCard post={post} currentUserId={session?.user?.id} saved={savedPostIds.has(post.id)} onSave={toggleSavedPost} onReact={toggleReaction} onComment={addComment} onDelete={deletePost} onUpdate={(updated) => setPosts((items) => items.map((item) => item.id === updated.id ? { ...item, ...updated } : item))} /></div>)}
                </div>
                <aside className="hidden lg:block">
                  <Card className="sticky top-24 rounded-2xl p-4 shadow-sm">
                    <div className="mb-3 flex items-center gap-2 font-semibold"><Users className="h-4 w-4 text-brand-600" /> Artisans à découvrir</div>
                    <div className="space-y-3">{suggestedArtisans.slice(0, 5).map((artisan) => <div key={artisan.id} className="flex items-center gap-2 rounded-xl p-2 hover:bg-brand-50"><Link href={`/artisan/${artisan.id}`} className="flex min-w-0 flex-1 items-center gap-3"><Avatar><AvatarImage src={artisan.user?.avatar || artisan.user?.image || undefined} /><AvatarFallback>{initials({ id: artisan.id, name: artisan.user?.name })}</AvatarFallback></Avatar><span className="min-w-0"><span className="block truncate text-sm font-semibold">{artisan.user?.name || 'Artisan'}</span><span className="block truncate text-xs text-slate-500">{artisan.profession || 'Artisan professionnel'}</span></span></Link><button type="button" onClick={() => void toggleFavorite(artisan.id)} className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${favoriteArtisanIds.has(artisan.id) ? 'bg-slate-100 text-slate-600' : 'bg-brand-600 text-white'}`}>{favoriteArtisanIds.has(artisan.id) ? 'Suivi' : 'Suivre'}</button></div>)}</div>
                  </Card>
                </aside>
              </div>
    </main>
  );
}

function PostCard({ post, currentUserId, saved, onSave, onReact, onComment, onDelete, onUpdate }: { post: Post; currentUserId?: string; saved: boolean; onSave: (postId: string) => void; onReact: (post: Post) => void; onComment: (postId: string, value: string) => Promise<void>; onDelete: (postId: string) => void; onUpdate: (post: Post) => void }) {
  const [comment, setComment] = useState('');
  const [editingPost, setEditingPost] = useState(false);
  const [postTitle, setPostTitle] = useState(post.title || '');
  const [postContent, setPostContent] = useState(post.content);

  async function savePost() {
    const response = await fetch(`/api/social/posts/${post.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: postTitle, content: postContent }) });
    const data = await response.json();
    if (!response.ok) return toast.error(data.error || 'Modification impossible');
    onUpdate({ ...post, title: data.post.title, content: data.post.content });
    setEditingPost(false);
    toast.success('Publication modifiée');
  }

  async function sharePost() {
    const url = `${window.location.origin}/social/${post.id}`;
    try {
      if (navigator.share) await navigator.share({ title: post.title || 'Réalisations Finda', text: post.content, url });
      else { await navigator.clipboard.writeText(url); toast.success('Lien copié'); }
    } catch { /* Le partage natif peut être annulé. */ }
  }

  async function updateComment(commentId: string, content: string) {
    const response = await fetch(`/api/social/posts/${post.id}/comments/${commentId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content }) });
    const data = await response.json();
    if (!response.ok) return toast.error(data.error || 'Modification du commentaire impossible');
    onUpdate({ ...post, comments: post.comments.map((item) => item.id === commentId ? { ...item, content: data.comment.content } : item) });
  }

  async function deleteComment(commentId: string) {
    const response = await fetch(`/api/social/posts/${post.id}/comments/${commentId}`, { method: 'DELETE' });
    if (!response.ok) return toast.error('Suppression du commentaire impossible');
    onUpdate({ ...post, comments: post.comments.filter((item) => item.id !== commentId), _count: { ...post._count, comments: Math.max(0, post._count.comments - 1) } });
  }

  return (
    <Card className="mb-4 overflow-hidden">
      <div className="flex items-center gap-3 p-4">
        <Avatar><AvatarImage src={post.author.image || post.author.avatar || undefined} /><AvatarFallback>{initials(post.author)}</AvatarFallback></Avatar>
        <div className="min-w-0 flex-1"><p className="font-semibold text-slate-900">{nameOf(post.author)}</p><p className="text-xs text-slate-500">{post.author.artisan?.profession || 'Artisan'} · {new Date(post.createdAt).toLocaleDateString('fr-FR')}</p></div>
        {currentUserId === post.author.id && <div className="flex"><button aria-label="Modifier la publication" onClick={() => setEditingPost(true)} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-brand-700"><Pencil className="h-4 w-4" /></button><button aria-label="Supprimer la publication" onClick={() => onDelete(post.id)} className="rounded-full p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button></div>}
      </div>
      {editingPost ? <div className="space-y-2 px-4 pb-3"><Input value={postTitle} onChange={(e) => setPostTitle(e.target.value)} placeholder="Titre" maxLength={120} /><Textarea value={postContent} onChange={(e) => setPostContent(e.target.value)} rows={4} maxLength={5000} /><div className="flex justify-end gap-2"><Button variant="outline" type="button" onClick={() => setEditingPost(false)}>Annuler</Button><Button type="button" onClick={savePost}>Enregistrer</Button></div></div> : <><h2 className={post.title ? 'px-4 text-lg font-bold text-slate-900' : 'hidden'}>{post.title}</h2><p className="whitespace-pre-wrap px-4 pb-3 pt-2 text-sm leading-6 text-slate-700">{post.content}</p></>}
      {(post.category || post.location) && <div className="flex flex-wrap gap-3 px-4 pb-3 text-xs text-slate-500">{post.category && <span>{post.category}</span>}{post.location && <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{post.location}</span>}</div>}
      {post.mediaUrls.length > 0 && <div className={`grid gap-0.5 ${post.mediaUrls.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>{post.mediaUrls.map((url, index) => post.mediaTypes[index] === 'video' ? <video key={url} src={url} controls preload="metadata" className="max-h-[520px] w-full bg-black object-contain" /> : <img key={url} src={url} alt={post.title || 'Réalisation artisanale'} className="max-h-[520px] w-full object-cover" />)}</div>}
      <div className="flex flex-wrap items-center gap-1 px-2 py-2 text-sm text-slate-600 sm:gap-2 sm:px-4">
        <button onClick={() => onReact(post)} className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 font-medium ${post.reacted ? 'text-brand-700 bg-brand-50' : 'hover:bg-slate-50'}`}><Heart className={`h-5 w-5 ${post.reacted ? 'fill-current' : ''}`} /> {post._count.reactions}</button>
        <span className="inline-flex items-center gap-2 px-3 py-2"><MessageCircle className="h-5 w-5" /> {post._count.comments}</span>
        <button onClick={sharePost} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-slate-50"><Share2 className="h-5 w-5" /> Partager</button>
        <button onClick={() => onSave(post.id)} aria-label={saved ? 'Retirer des publications enregistrées' : 'Enregistrer la publication'} className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-slate-50 ${saved ? 'text-brand-700' : ''}`}><Bookmark className={`h-5 w-5 ${saved ? 'fill-current' : ''}`} /><span className="hidden sm:inline">{saved ? 'Enregistrée' : 'Enregistrer'}</span></button>
        {post.author.artisan?.id && currentUserId !== post.author.id && (
          <Link href={`/missions/create?artisanId=${encodeURIComponent(post.author.artisan.id || '')}&artisan=${encodeURIComponent(nameOf(post.author))}`} className="inline-flex items-center gap-1.5 rounded-lg bg-brand-50 px-3 py-2 font-semibold text-brand-700 hover:bg-brand-100">
            <ClipboardCheck className="h-4 w-4" /> Devis
          </Link>
        )}
        {post.author.artisan?.id && <Link href={`/artisan/${post.author.artisan.id}`} className="ml-auto px-2 py-2 text-xs font-semibold text-brand-700 hover:underline sm:text-sm">Voir le profil</Link>}
      </div>
      {post.comments.length > 0 && <div className="border-t bg-slate-50 px-4 py-3 space-y-2">{post.comments.map((item) => <div key={item.id} className="flex items-start gap-2 text-sm"><span className="min-w-0 flex-1"><span className="font-semibold">{nameOf(item.author)} </span><span className="text-slate-700">{item.content}</span></span>{currentUserId === item.author.id && <div className="flex shrink-0"><button aria-label="Modifier le commentaire" onClick={() => { const next = window.prompt('Modifier le commentaire', item.content); if (next && next.trim()) void updateComment(item.id, next.trim()); }} className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-brand-700"><Pencil className="h-3.5 w-3.5" /></button><button aria-label="Supprimer le commentaire" onClick={() => void deleteComment(item.id)} className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></button></div>}</div>)}</div>}
      <form className="flex gap-2 border-t p-3" onSubmit={(event) => { event.preventDefault(); if (!currentUserId) { toast.info('Connectez-vous pour commenter'); return; } onComment(post.id, comment).then(() => setComment('')); }}>
        <Input value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Ajouter un commentaire…" maxLength={1000} />
        <Button type="submit" size="icon" aria-label="Envoyer"><Send className="h-4 w-4" /></Button>
      </form>
    </Card>
  );
}

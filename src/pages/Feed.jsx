import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function Feed({ user, currentLang }) {
  const [posts, setPosts] = useState([
    {
      id: 1,
      username: 'bayan_uyuz',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
      caption: 'Yeni projeler, yeni tasarımlar geliyor... 🚀✨ #coding #webdesign',
      likes: 124,
      liked: false,
      comments: [
        { id: 1, user: 'sedat', text: 'Harika görünüyor sevgilim! 🔥' },
        { id: 2, user: 'erdem', text: 'Eline sağlık hocam.' }
      ]
    },
    {
      id: 2,
      username: 'hayaprotect_official',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&auto=format&fit=crop&q=80',
      caption: 'En yeni ürünlerimiz şimdi yayında! Göz atmayı unutmayın. 🛒🌿',
      likes: 89,
      liked: true,
      comments: []
    }
  ]);

  const [newComment, setNewComment] = useState({});
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostImage, setNewPostImage] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  
  const handleLike = (id) => {
    setPosts(posts.map(post => {
      if (post.id === id) {
        return {
          ...post,
          liked: !post.liked,
          likes: post.liked ? post.likes - 1 : post.likes + 1
        };
      }
      return post;
    }));
  };

  
  const handleAddComment = (postId, e) => {
    e.preventDefault();
    const commentText = newComment[postId];
    if (!commentText || !commentText.trim()) return;

    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: [
            ...post.comments,
            { id: Date.now(), user: user?.email ? user.email.split('@')[0] : 'misafir', text: commentText }
          ]
        };
      }
      return post;
    }));

    setNewComment({ ...newComment, [postId]: '' });
  };

  
  const handleCreatePost = (e) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    const newPost = {
      id: Date.now(),
      username: user?.email ? user.email.split('@')[0] : 'bayan_uyuz',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      image: newPostImage || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
      caption: newPostContent,
      likes: 0,
      liked: false,
      comments: []
    };

    setPosts([newPost, ...posts]);
    setNewPostContent('');
    setNewPostImage('');
    setShowCreateModal(false);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8 space-y-6">
      
      
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex gap-4 overflow-x-auto scrollbar-none shadow-sm">
        {[
          { name: 'Hikayen', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', isUser: true },
          { name: 'sedat', img: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80' },
          { name: 'hayaprotect', img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80' },
          { name: 'erdem', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
          { name: 'coding_tr', img: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80' }
        ].map((story, index) => (
          <div key={index} className="flex flex-col items-center gap-1.5 cursor-pointer shrink-0">
            <div className={`w-16 h-16 rounded-full p-[2px] ${story.isUser ? 'bg-slate-300' : 'bg-gradient-to-tr from-amber-500 to-pink-500'}`}>
              <img src={story.img} alt={story.name} className="w-full h-full object-cover rounded-full border-2 border-white" />
            </div>
            <span className="text-xs font-medium text-slate-700 truncate w-16 text-center">{story.name}</span>
          </div>
        ))}
      </div>

     
      {user && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <span className="text-sm font-medium text-slate-500">Ne düşünüyorsun, {user.email?.split('@')[0]}?</span>
          </div>
          <button 
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-800 transition cursor-pointer"
          >
            + Gönderi Paylaş
          </button>
        </div>
      )}

     
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-slate-900">Yeni Gönderi Oluştur</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-700 font-bold">✕</button>
            </div>
            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Açıklama / Metin</label>
                <textarea 
                  rows="3"
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="Aklındakileri paylaş..." 
                  className="w-full border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Görsel URL (İsteğe bağlı)</label>
                <input 
                  type="text"
                  value={newPostImage}
                  onChange={(e) => setNewPostImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..." 
                  className="w-full border rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold text-sm hover:bg-slate-800 transition cursor-pointer"
              >
                Paylaş
              </button>
            </form>
          </div>
        </div>
      )}

   
      <div className="space-y-6">
        {posts.map(post => (
          <div key={post.id} className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
            
            
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <img src={post.avatar} alt={post.username} className="w-10 h-10 rounded-full object-cover border" />
                <span className="font-bold text-sm text-slate-900">{post.username}</span>
              </div>
              <span className="text-slate-400 font-bold">•••</span>
            </div>

            
            {post.image && (
              <div className="w-full bg-slate-100 max-h-[450px] overflow-hidden flex items-center justify-center">
                <img src={post.image} alt="Post content" className="w-full h-full object-cover" />
              </div>
            )}

            
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-xl">
                  <button 
                    type="button" 
                    onClick={() => handleLike(post.id)}
                    className={`cursor-pointer transition transform active:scale-125 ${post.liked ? 'text-red-500' : 'text-slate-700 hover:text-slate-900'}`}
                  >
                    {post.liked ? '❤️' : '🤍'}
                  </button>
                  <button type="button" className="cursor-pointer text-slate-700 hover:text-slate-900">💬</button>
                  <button type="button" className="cursor-pointer text-slate-700 hover:text-slate-900">✈️</button>
                </div>
                <button type="button" className="cursor-pointer text-slate-700 hover:text-slate-900">🔖</button>
              </div>

             
              <div className="text-xs font-bold text-slate-900">
                {post.likes} Beğeni
              </div>

            
              <div className="text-sm text-slate-800">
                <span className="font-bold mr-2">{post.username}</span>
                {post.caption}
              </div>

              
              {post.comments.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  {post.comments.map(comment => (
                    <div key={comment.id} className="text-xs text-slate-700">
                      <span className="font-bold mr-2 text-slate-900">{comment.user}</span>
                      {comment.text}
                    </div>
                  ))}
                </div>
              )}

              {/* Yorum Yapma Kutusu */}
              <form onSubmit={(e) => handleAddComment(post.id, e)} className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <input 
                  type="text"
                  placeholder="Yorum ekle..."
                  value={newComment[post.id] || ''}
                  onChange={(e) => setNewComment({ ...newComment, [post.id]: e.target.value })}
                  className="w-full text-xs bg-slate-50 border rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
                <button type="submit" className="text-xs font-bold text-teal-600 hover:text-teal-700 cursor-pointer px-2">
                  Paylaş
                </button>
              </form>

            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
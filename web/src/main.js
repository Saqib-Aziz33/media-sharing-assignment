import { api } from "./api";
import "./style.css";

const app = document.querySelector("#app");

// State
let currentUser = JSON.parse(localStorage.getItem("user")) || null;
let currentView = currentUser ? (currentUser.role === "creator" ? "dashboard" : "feed") : "login";
let currentPostId = null;
let currentSearch = "";

// Routing logic
const navigateTo = (view, data = null) => {
  currentView = view;
  if (data) currentPostId = data.id;
  render();
};

const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  currentUser = null;
  currentSearch = "";
  navigateTo("login");
};

// Components
const Navbar = () => `
  <nav class="flex justify-between items-center p-4 bg-slate-800 border-b border-slate-700">
    <div class="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">MediaShare</div>
    <div class="flex gap-4">
      ${currentUser ? `
        <span class="text-slate-400 self-center">Welcome, ${currentUser.name} (${currentUser.role})</span>
        ${currentUser.role === 'creator' ?
      `<button onclick="window.dispatch('nav-dashboard')" class="text-slate-300 hover:text-white">Dashboard</button>` :
      `<button onclick="window.dispatch('nav-feed')" class="text-slate-300 hover:text-white">Feed</button>`
    }
        <button onclick="window.dispatch('logout')" class="text-red-400 hover:text-red-300">Logout</button>
      ` : ''}
    </div>
  </nav>
`;

const LoginForm = () => `
  <div class="flex items-center justify-center min-h-screen">
    <div class="card w-full max-w-md">
      <h2 class="text-2xl font-bold mb-6 text-center text-white">Login</h2>
      <form onsubmit="window.dispatch('login', event)">
        <div class="mb-4">
          <label class="block text-sm font-medium text-slate-400">Email</label>
          <input type="email" name="email" class="input-field" required>
        </div>
        <div class="mb-6">
          <label class="block text-sm font-medium text-slate-400">Password</label>
          <input type="password" name="password" class="input-field" required>
        </div>
        <button type="submit" class="w-full btn-primary mb-4">Login</button>
      </form>
      <p class="text-center text-slate-400">
        Don't have an account? <a href="#" onclick="window.dispatch('nav-register')" class="text-blue-400 hover:underline">Register</a>
      </p>
    </div>
  </div>
`;

const RegisterForm = () => `
  <div class="flex items-center justify-center min-h-screen">
    <div class="card w-full max-w-md">
      <h2 class="text-2xl font-bold mb-6 text-center text-white">Register</h2>
      <form onsubmit="window.dispatch('register', event)">
        <div class="mb-4">
          <label class="block text-sm font-medium text-slate-400">Name</label>
          <input type="text" name="name" class="input-field" required>
        </div>
        <div class="mb-4">
          <label class="block text-sm font-medium text-slate-400">Email</label>
          <input type="email" name="email" class="input-field" required>
        </div>
        <div class="mb-4">
          <label class="block text-sm font-medium text-slate-400">Password</label>
          <input type="password" name="password" class="input-field" required>
        </div>
        <div class="mb-6">
          <label class="block text-sm font-medium text-slate-400">Role</label>
          <select name="role" class="input-field" required>
            <option value="consumer">Consumer</option>
            <option value="creator">Creator</option>
          </select>
        </div>
        <button type="submit" class="w-full btn-primary mb-4">Register</button>
      </form>
      <p class="text-center text-slate-400">
        Already have an account? <a href="#" onclick="window.dispatch('nav-login')" class="text-blue-400 hover:underline">Login</a>
      </p>
    </div>
  </div>
`;

const SearchBar = () => `
  <div class="mb-6">
    <form onsubmit="window.dispatch('search', event)" class="flex gap-2">
      <input 
        type="text" 
        name="search" 
        value="${currentSearch}" 
        placeholder="Search posts..." 
        class="input-field mt-0"
      >
      <button type="submit" class="btn-primary">Search</button>
      ${currentSearch ? `<button type="button" onclick="window.dispatch('clear-search')" class="btn-secondary">Clear</button>` : ''}
    </form>
  </div>
  </div>
`;

const buildCommentTree = (comments) => {
  const map = {};
  const roots = [];
  const sorted = [...comments].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)); // Sort by Date

  sorted.forEach(c => {
    map[c._id] = { ...c, children: [] };
  });

  sorted.forEach(c => {
    if (c.parent && map[c.parent]) {
      map[c.parent].children.push(map[c._id]);
    } else {
      roots.push(map[c._id]);
    }
  }); // Reverse roots to show newest at bottom? Or top? Usually comments are Oldest Top or Newest Top.
  // Logic: Standard layout is usually oldest first for threads. 
  return roots;
};

const renderCommentNode = (comment, depth = 0) => {
  const safeText = comment.text ? comment.text.replace(/</g, "&lt;").replace(/>/g, "&gt;") : "";
  const margin = depth > 0 ? 'ml-4 sm:ml-8 border-l-2 border-slate-800 pl-3' : '';

  return `
      <div class="comment-node ${margin} mt-3">
         <div class="bg-slate-900/50 p-3 rounded-md border border-slate-800 hover:border-slate-700 transition-colors">
             <div class="flex justify-between items-start mb-1">
                 <span class="font-bold text-sm text-blue-400">${comment.user?.name || 'Unknown'}</span>
                 <span class="text-[10px] text-slate-500">${new Date(comment.createdAt).toLocaleDateString()}</span>
             </div>
             <p class="text-slate-300 text-sm break-all">${safeText}</p>
             <button class="text-xs text-slate-400 hover:text-white mt-2 font-medium" onclick="window.dispatch('toggle-reply', '${comment._id}')">Reply</button>
             
             <!-- Reply Form -->
             <form id="reply-form-${comment._id}" class="hidden mt-2 flex gap-2" onsubmit="window.dispatch('submit-reply', event)" data-post-id="${comment.post}" data-parent-id="${comment._id}">
                 <input type="text" name="text" class="input-field mt-0 py-1 text-xs bg-slate-950" placeholder="Reply..." required>
                 <button type="submit" class="btn-primary py-1 px-3 text-xs">Send</button>
             </form>
         </div>
         <div class="children-container">
             ${comment.children.map(c => renderCommentNode(c, depth + 1)).join('')}
         </div>
      </div>
    `;
};

const CreatorDashboard = async () => {
  let posts = [];
  try {
    const res = await api.getPosts(currentSearch);
    posts = res.posts;
  } catch (e) {
    console.error(e);
    posts = [];
  }

  const myPosts = posts.filter(p => p.creator?._id === currentUser._id || p.creator === currentUser._id);

  return `
    <div class="container mx-auto px-4 py-8">
      <div class="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 class="text-3xl font-bold text-white">Creator Dashboard</h1>
        <button onclick="window.dispatch('open-create-modal')" class="btn-primary">Create New Post</button>
      </div>

      ${SearchBar()}

      ${myPosts.length === 0 ?
      `<div class="text-center text-slate-400 py-12">
            ${currentSearch ? `No posts found matching "${currentSearch}"` : 'No posts yet.'}
         </div>`
      : `
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        ${myPosts.map(post => `
          <div class="card relative group">
            <img src="${api.STATIC_URL}/${post.media.url.startsWith('/') ? post.media.url.slice(1) : post.media.url}" class="w-full h-48 object-cover rounded-md mb-4" alt="${post.title}">
            <h3 class="text-xl font-bold text-white mb-2">${post.title}</h3>
            <p class="text-slate-400 text-sm mb-4 line-clamp-2">${post.caption || ''}</p>
            <div class="flex justify-between items-center mt-4">
               <button onclick="window.dispatch('view-post', '${post._id}')" class="text-blue-400 hover:text-blue-300">View</button>
               <div class="flex gap-2">
                 <button onclick="window.dispatch('edit-post', '${post._id}')" class="text-yellow-400 hover:text-yellow-300">Edit</button>
                 <button onclick="window.dispatch('delete-post', '${post._id}')" class="text-red-400 hover:text-red-300">Delete</button>
               </div>
            </div>
          </div>
        `).join('')}
      </div>
      `}
      
      <!-- Create/Edit Modal -->
      <dialog id="postDialog" class="bg-slate-800 text-white p-6 rounded-lg backdrop:bg-black/50 w-full max-w-lg">
        <form onsubmit="window.dispatch('submit-post', event)">
            <input type="hidden" name="id" id="postId">
            <h3 class="text-xl font-bold mb-4" id="modalTitle">Create Post</h3>
            
            <div class="mb-4">
                <label class="block text-sm mb-1">Title</label>
                <input type="text" name="title" id="postTitle" class="input-field" required>
            </div>
             <div class="mb-4">
                <label class="block text-sm mb-1">Image</label>
                <input type="file" name="image" id="postImage" class="input-field text-white">
            </div>
            <div class="mb-4">
                <label class="block text-sm mb-1">Caption</label>
                <textarea name="caption" id="postCaption" class="input-field h-24"></textarea>
            </div>
            <div class="mb-4">
                <label class="block text-sm mb-1">People Present (comma separated names)</label>
                <input type="text" id="postPeople" class="input-field" placeholder="e.g. Alice, Bob">
            </div>
            <div class="mb-4">
                <label class="block text-sm mb-1">Location</label>
                <input type="text" name="location" id="postLocation" class="input-field">
            </div>

            <div class="flex justify-end gap-2 mt-6">
                <button type="button" onclick="document.getElementById('postDialog').close()" class="btn-secondary">Cancel</button>
                <button type="submit" class="btn-primary">Save</button>
            </div>
        </form>
      </dialog>
    </div>
  `;
};

const ConsumerFeed = async () => {
  let posts = [];
  try {
    const res = await api.getPosts(currentSearch);
    posts = res.posts;
  } catch (e) { console.error(e); }

  return `
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold text-white mb-8">Explore Feed</h1>
      
      ${SearchBar()}

      ${posts.length === 0 ?
      `<div class="text-center text-slate-400 py-12">
            ${currentSearch ? `No posts found matching "${currentSearch}"` : 'No posts available.'}
         </div>`
      : `
      <div class="max-w-2xl mx-auto space-y-8">
        ${posts.map(post => `
          <div class="card">
            <div class="flex items-center gap-3 mb-4">
                <div class="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center font-bold text-white">
                    ${post.creator?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                    <h3 class="font-bold text-white">${post.creator?.name || 'Unknown'}</h3>
                    <p class="text-xs text-slate-400">${post.location || ''}</p>
                </div>
            </div>
            
            <img src="${api.STATIC_URL}/${post.media.url.startsWith('/') ? post.media.url.slice(1) : post.media.url}" class="w-full rounded-lg mb-4 bg-black object-contain max-h-[500px]" alt="${post.title}">
            
            <h2 class="text-xl font-bold text-white mb-2">${post.title}</h2>
            <p class="text-slate-300 mb-4">${post.caption || ''}</p>
            
            <!-- Comments Section -->
            <div class="mt-4 border-t border-slate-700 pt-4 mb-4">
                <h4 class="text-white font-bold mb-3 text-sm uppercase tracking-wide">Comments (${post.comments?.length || 0})</h4>
                <div class="space-y-3 max-h-60 overflow-y-auto pr-1 custom-scrollbar mb-4">
                    ${post.comments && post.comments.length ?
          buildCommentTree(post.comments).map(root => renderCommentNode(root)).join('')
          : '<p class="text-slate-500 text-sm italic">No comments yet.</p>'}
                </div>
                
                <!-- Add Comment Form for Feed -->
                <form onsubmit="window.dispatch('add-comment', event)" data-post-id="${post._id}" class="flex gap-2">
                    <input type="text" name="comment" class="input-field mt-0 py-2 text-sm" placeholder="Add a comment..." required>
                    <button type="submit" class="btn-primary py-2 px-4 text-sm">Post</button>
                </form>
            </div>
          </div>
        `).join('')}
      </div>
      `}
    </div>
  `;
};

const PostDetails = async () => {
  if (!currentPostId) return navigateTo(currentUser.role === 'creator' ? 'dashboard' : 'feed');

  let post = null;
  try {
    const res = await api.getPost(currentPostId);
    post = res.post;
  } catch (e) {
    console.error(e);
    alert("Failed to load post");
    return navigateTo(currentUser.role === 'creator' ? 'dashboard' : 'feed');
  }

  return `
     <div class="container mx-auto px-4 py-8">
       <button onclick="window.history.back()" class="text-slate-400 hover:text-white mb-4">← Back</button>
       
       <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <!-- Image Section -->
         <div class="bg-black rounded-lg flex items-center justify-center p-2">
            <img src="${api.STATIC_URL}/${post.media.url.startsWith('/') ? post.media.url.slice(1) : post.media.url}" class="max-w-full max-h-[80vh] object-contain" alt="${post.title}">
         </div>

         <!-- Details Section -->
         <div class="card h-full flex flex-col">
            <div class="mb-6 border-b border-slate-700 pb-4">
                <h1 class="text-3xl font-bold text-white mb-2">${post.title}</h1>
                <div class="flex items-center gap-2 text-slate-400 mb-4">
                    <span>By ${post.creator?.name || 'Unknown'}</span>
                    <span>•</span>
                    <span>${new Date(post.createdAt).toLocaleDateString()}</span>
                    ${post.location ? `<span>• ${post.location}</span>` : ''}
                </div>
                ${post.peoplePresent && post.peoplePresent.length ? `
                    <div class="mb-4 text-slate-300">
                        <span class="font-bold text-slate-400">With:</span> ${post.peoplePresent.join(', ')}
                    </div>
                ` : ''}
                <p class="text-slate-300">${post.caption || ''}</p>
            </div>

            <!-- Comments -->
            <div class="flex-1 overflow-y-auto mb-4 space-y-4 pr-2">
                ${post.comments.length ? post.comments.map(c => `
                    <div class="bg-slate-900 p-3 rounded-md">
                        <div class="flex justify-between items-start mb-1">
                            <span class="font-bold text-sm text-blue-400">${c.user?.name || 'User'}</span>
                            <span class="text-xs text-slate-500">${new Date(c.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p class="text-slate-300 text-sm">${c.text}</p>
                    </div>
                `).join('') : '<p class="text-slate-500 italic">No comments yet.</p>'}
            </div>

            <!-- Add Comment -->
            <form onsubmit="window.dispatch('add-comment', event)" class="mt-auto">
                <div class="flex gap-2">
                    <input type="text" name="comment" class="input-field mt-0" placeholder="Add a comment..." required>
                    <button type="submit" class="btn-primary">Post</button>
                </div>
            </form>
         </div>
       </div>
     </div>
   `;
};


// Event Handler
window.dispatch = async (action, payload) => {
  if (payload instanceof Event) {
    payload.preventDefault();
  }

  try {
    switch (action) {
      case 'nav-login': navigateTo('login'); break;
      case 'nav-register': navigateTo('register'); break;
      case 'nav-dashboard': {
        currentSearch = "";
        navigateTo('dashboard');
        break;
      }
      case 'nav-feed': {
        currentSearch = "";
        navigateTo('feed');
        break;
      }
      case 'logout': logout(); break;

      case 'login': {
        const form = payload.target;
        const data = await api.login(form.email.value, form.password.value);
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        currentUser = data.user;
        navigateTo(currentUser.role === 'creator' ? 'dashboard' : 'feed');
        break;
      }

      case 'register': {
        const form = payload.target;
        await api.register(form.name.value, form.email.value, form.password.value, form.role.value);
        alert("Registration successful! Please login.");
        navigateTo('login');
        break;
      }

      case 'search': {
        const form = payload.target;
        currentSearch = form.search.value;
        render(); // Re-render to trigger fetch with new search term
        break;
      }

      case 'clear-search': {
        currentSearch = "";
        render();
        break;
      }

      case 'view-post':
        navigateTo('post', { id: payload });
        break;

      case 'add-comment': {
        const form = payload.target;
        const text = form.comment.value;
        const id = form.dataset.postId || currentPostId;

        if (id) {
          try {
            // Optimistic update or wait for success
            await api.addComment(id, text);

            // Get container (previous sibling in both layouts)
            const commentsContainer = form.previousElementSibling;

            if (commentsContainer) {
              // Create comment HTML
              const commentHtml = `
                        <div class="bg-slate-900/50 p-3 rounded-md border border-slate-800">
                            <div class="flex justify-between items-start mb-1">
                                <span class="font-bold text-sm text-blue-400">${currentUser.name}</span>
                                <span class="text-[10px] text-slate-500">${new Date().toLocaleDateString()}</span>
                            </div>
                            <p class="text-slate-300 text-sm">${text.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
                        </div>
                    `;

              // Remove empty state if present
              if (commentsContainer.innerText.includes('No comments yet')) {
                commentsContainer.innerHTML = '';
              }

              commentsContainer.insertAdjacentHTML('beforeend', commentHtml);
              commentsContainer.scrollTop = commentsContainer.scrollHeight;

              // Update counter if present (Feed view)
              const countHeader = commentsContainer.previousElementSibling;
              if (countHeader && countHeader.tagName === 'H4') {
                const match = countHeader.innerText.match(/\d+/);
                if (match) {
                  const newCount = parseInt(match[0]) + 1;
                  countHeader.innerText = `COMMENTS (${newCount})`;
                }
              }
            }

            form.reset();
          } catch (e) {
            console.error(e);
            alert("Failed to add comment");
          }
        }
        break;
      }

      case 'toggle-reply': {
        const id = payload;
        const form = document.getElementById(`reply-form-${id}`);
        if (form) {
          form.classList.toggle('hidden');
        }
        break;
      }

      case 'submit-reply': {
        const form = payload.target;
        const text = form.text.value;
        const postId = form.dataset.postId;
        const parentId = form.dataset.parentId;

        try {
          const data = await api.addComment(postId, text, parentId);

          // Append reply manually to the DOM
          // Find the comment node
          const formContainer = form.parentElement; // div.bg-slate...
          const commentNode = formContainer.parentElement; // div.comment-node

          let childrenContainer = commentNode.querySelector('.children-container');

          // If it doesn't exist, create it
          if (!childrenContainer) {
            childrenContainer = document.createElement('div');
            childrenContainer.className = 'children-container';
            commentNode.appendChild(childrenContainer);
          }

          // Create new comment object for rendering
          const newComment = {
            _id: data._id || 'temp-' + Date.now(),
            user: currentUser,
            text: text,
            createdAt: new Date().toISOString(),
            children: [],
            post: postId,
            parent: parentId
          };

          // Render and append
          const html = renderCommentNode(newComment, 1);
          childrenContainer.insertAdjacentHTML('beforeend', html);

          form.reset();
          form.classList.add('hidden');
        } catch (e) {
          console.error(e);
          alert("Failed to add reply");
        }
        break;
      }

      case 'delete-post': {
        if (confirm("Are you sure?")) {
          await api.deletePost(payload);
          render();
        }
        break;
      }

      case 'open-create-modal': {
        const dialog = document.getElementById('postDialog');
        document.getElementById('postId').value = '';
        document.getElementById('modalTitle').innerText = 'Create Post';
        dialog.querySelector('form').reset();
        document.getElementById('postPeople').value = '';
        dialog.showModal();
        break;
      }

      case 'edit-post': {
        const res = await api.getPost(payload);
        const p = res.post;
        const dialog = document.getElementById('postDialog');
        document.getElementById('postId').value = p._id;
        document.getElementById('modalTitle').innerText = 'Edit Post';
        document.getElementById('postTitle').value = p.title;
        document.getElementById('postCaption').value = p.caption || '';
        document.getElementById('postPeople').value = p.peoplePresent ? p.peoplePresent.join(', ') : '';
        document.getElementById('postLocation').value = p.location || '';
        dialog.showModal();
        break;
      }

      case 'submit-post': {
        const form = payload.target;
        const formData = new FormData(form);
        const id = document.getElementById('postId').value;
        const peopleInput = document.getElementById('postPeople').value;

        if (peopleInput) {
          const people = peopleInput.split(',').map(p => p.trim()).filter(p => p);
          people.forEach(p => formData.append('peoplePresent', p));
        }

        try {
          if (id) {
            await api.updatePost(id, formData);
          } else {
            await api.createPost(formData);
          }
          document.getElementById('postDialog').close();
          render();
        } catch (e) {
          alert(e.message || "Error saving post");
        }
        break;
      }
    }
  } catch (err) {
    console.error(err);
    alert(err.message || "An error occurred");
  }
};

window.history.back = () => {
  // Simple history management
  if (currentView === 'post') {
    navigateTo(currentUser.role === 'creator' ? 'dashboard' : 'feed');
  }
}

// Render loop
const render = async () => {
  app.innerHTML = '<div class="text-center text-white mt-10">Loading...</div>';

  let content = '';

  if (currentView === 'login') {
    content = LoginForm();
  } else if (currentView === 'register') {
    content = RegisterForm();
  } else {
    // Authenticated Base Layout
    const navbar = Navbar();
    let main = '';

    if (currentView === 'dashboard') {
      if (currentUser.role !== 'creator') {
        navigateTo('feed');
        return;
      }
      main = await CreatorDashboard();
    } else if (currentView === 'feed') {
      if (currentUser.role !== 'consumer') {
        navigateTo('dashboard');
        return;
      }
      main = await ConsumerFeed();
    } else if (currentView === 'post') {
      main = await PostDetails();
    }

    content = `
            <div class="min-h-screen">
                ${navbar}
                ${main}
            </div>
        `;
  }

  app.innerHTML = content;
};

// Init
if (currentUser) {
  if (currentView === 'login' || currentView === 'register') {
    currentView = currentUser.role === 'creator' ? 'dashboard' : 'feed';
  }
} else {
  currentView = 'login';
}
render();

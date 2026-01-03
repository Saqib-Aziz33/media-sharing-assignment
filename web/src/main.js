import { api } from "./api";
import "./style.css";

const app = document.querySelector("#app");

// State
let currentUser = JSON.parse(localStorage.getItem("user")) || null;
let currentView = currentUser ? (currentUser.role === "creator" ? "dashboard" : "feed") : "login";
let currentPostId = null;

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

const CreatorDashboard = async () => {
  let posts = [];
  try {
    const res = await api.getPosts();
    posts = res.posts; // API returns array directly now based on my edit
  } catch (e) {
    console.error(e);
    posts = [];
  }

  // Filter posts for this creator only
  // Actually the getAll API returns all posts. A real app usually filters on backend for 'my posts'.
  // Use `creator._id` comparison.
  const myPosts = posts.filter(p => p.creator?._id === currentUser._id || p.creator === currentUser._id);

  return `
    <div class="container mx-auto px-4 py-8">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold text-white">Creator Dashboard</h1>
        <button onclick="window.dispatch('open-create-modal')" class="btn-primary">Create New Post</button>
      </div>

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
      
      <!-- Create/Edit Modal (simplistic implementation) -->
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
    const res = await api.getPosts();
    posts = res.posts;
  } catch (e) { console.error(e); }

  return `
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold text-white mb-8">Explore Feed</h1>
      
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
            
            <button onclick="window.dispatch('view-post', '${post._id}')" class="text-blue-400 hover:text-blue-300 font-medium">
                View Details & Comments (${post.comments?.length || 0})
            </button>
          </div>
        `).join('')}
      </div>
    </div>
  `;
};

const PostDetails = async () => {
  if (!currentPostId) return navigateTo(currentUser.role === 'creator' ? 'dashboard' : 'feed');

  let post = null;
  try {
    const res = await api.getPost(currentPostId);
    post = res.post; // Adjusted based on latest 'getById' response structure { post: {} }
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
      case 'nav-dashboard': navigateTo('dashboard'); break;
      case 'nav-feed': navigateTo('feed'); break;
      case 'logout': logout(); break;

      case 'login': {
        const form = payload.target;
        const data = await api.login(form.email.value, form.password.value);
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user)); // Corrected accessor
        currentUser = data.user;
        navigateTo(currentUser.role === 'creator' ? 'dashboard' : 'feed');
        break;
      }

      case 'register': {
        const form = payload.target;
        const data = await api.register(form.name.value, form.email.value, form.password.value, form.role.value);
        // Auto login or ask to login? Let's auto login or redirect to login.
        // Assuming register returns user/token similar to login? Usually register just creates.
        // If the API returns token on register, we can log in.
        // Checking auth.controller.js would be ideal but let's assume redirect to login.
        alert("Registration successful! Please login.");
        navigateTo('login');
        break;
      }

      case 'view-post':
        navigateTo('post', { id: payload });
        break;

      case 'add-comment': {
        const form = payload.target;
        const text = form.comment.value;
        await api.addComment(currentPostId, text);
        form.reset();
        render(); // refresh
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
        dialog.showModal();
        break;
      }

      case 'edit-post': {
        // We need to fetch the post details again or find it in the list if we had it but here access is tricky unless we store posts.
        // For simplicity, let's fetch it or just not support pre-filling correctly in this simple version without a store.
        // Let's simplified: fetch it first.
        const res = await api.getPost(payload);
        const p = res.post;
        const dialog = document.getElementById('postDialog');
        document.getElementById('postId').value = p._id;
        document.getElementById('modalTitle').innerText = 'Edit Post';
        document.getElementById('postTitle').value = p.title;
        document.getElementById('postCaption').value = p.caption || '';
        document.getElementById('postLocation').value = p.location || '';
        // Image handling is tricky for edit (optional), handled in backend
        dialog.showModal();
        break;
      }

      case 'submit-post': {
        const form = payload.target;
        const formData = new FormData(form);
        const id = document.getElementById('postId').value;

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
        // The requirement says "consumer should not access the creator dashboard", 
        // but doesn't explicitly ban creator from feed. I'll allow creator to see feed or just redirect.
        // "if user is creator then it will be redirected to post creation dashboard... if role is consumer he will be redirected to viewer page"
        // Implies separation.
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

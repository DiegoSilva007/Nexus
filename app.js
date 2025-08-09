       // Dados iniciais
        let currentUser = {
            name: "Hello Kitty",
            bio: "Designer gráfica e amante de fotografia 📸 | Criando conteúdo digital",
            profilePic: "img/hello kitty.jpg"
        };
        
        let posts = [];
        let selectedMedia = null;
        let newProfilePicPreview = null;
        let postToDelete = null;
        
        // Elementos do DOM
        const backBtn = document.getElementById('backBtn');
        const profileName = document.getElementById('profileName');
        const profileBio = document.getElementById('profileBio');
        const profilePic = document.getElementById('profilePic');
        const editProfileBtn = document.getElementById('editProfileBtn');
        const editPicBtn = document.getElementById('editPicBtn');
        const postInput = document.getElementById('postInput');
        const photoBtn = document.getElementById('photoBtn');
        const videoBtn = document.getElementById('videoBtn');
        const mediaInput = document.getElementById('mediaInput');
        const postBtn = document.getElementById('postBtn');
        const postsContainer = document.getElementById('postsContainer');
        const noPosts = document.getElementById('noPosts');
        const editProfileModal = document.getElementById('editProfileModal');
        const newNameInput = document.getElementById('newName');
        const newBioInput = document.getElementById('newBio');
        const fileInputLabel = document.getElementById('fileInputLabel');
        const newProfilePicFile = document.getElementById('newProfilePicFile');
        const previewContainer = document.getElementById('previewContainer');
        const cancelEditProfile = document.getElementById('cancelEditProfile');
        const saveProfile = document.getElementById('saveProfile');
        const confirmDeleteModal = document.getElementById('confirmDeleteModal');
        const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
        const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
        
        // Event Listeners
        backBtn.addEventListener('click', () => {
            alert('Voltando para o feed... (Esta funcionalidade será implementada na página do feed)');
        });
        
        editProfileBtn.addEventListener('click', () => {
            openEditProfileModal();
        });
        
        editPicBtn.addEventListener('click', () => {
            openEditProfileModal();
        });
        
        function openEditProfileModal() {
            newNameInput.value = currentUser.name;
            newBioInput.value = currentUser.bio;
            previewContainer.innerHTML = '';
            newProfilePicPreview = null;
            editProfileModal.style.display = 'flex';
        }
        
        cancelEditProfile.addEventListener('click', () => {
            editProfileModal.style.display = 'none';
            previewContainer.innerHTML = '';
            newProfilePicPreview = null;
        });
        
        newProfilePicFile.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                const file = e.target.files[0];
                if (file.type.match('image.*')) {
                    // Criar preview da imagem
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        newProfilePicPreview = event.target.result;
                        renderPreview();
                    };
                    reader.readAsDataURL(file);
                }
            }
        });
        
        function renderPreview() {
            previewContainer.innerHTML = '';
            if (newProfilePicPreview) {
                const previewItem = document.createElement('div');
                previewItem.className = 'preview-item';
                
                previewItem.innerHTML = `
                    <img src="${newProfilePicPreview}" class="preview-image">
                    <button class="remove-preview" id="removePreviewBtn">
                        <i class="fas fa-times"></i>
                    </button>
                `;
                
                previewContainer.appendChild(previewItem);
                
                const removeBtn = document.getElementById('removePreviewBtn');
                removeBtn.addEventListener('click', () => {
                    newProfilePicPreview = null;
                    previewContainer.innerHTML = '';
                    newProfilePicFile.value = '';
                });
            }
        }
        
        saveProfile.addEventListener('click', () => {
            const newName = newNameInput.value.trim();
            const newBio = newBioInput.value.trim();
            
            if (newName) {
                currentUser.name = newName;
                profileName.textContent = newName;
            }
            
            currentUser.bio = newBio || " ";
            profileBio.textContent = currentUser.bio;
            profileBio.style.display = currentUser.bio.trim() ? "block" : "none";
            
            if (newProfilePicPreview) {
                currentUser.profilePic = newProfilePicPreview;
                profilePic.src = newProfilePicPreview;
            }
            
            editProfileModal.style.display = 'none';
            previewContainer.innerHTML = '';
        });
        
        // Drag and drop para fotos de perfil
        fileInputLabel.addEventListener('dragover', (e) => {
            e.preventDefault();
            fileInputLabel.style.borderColor = '#0095f6';
            fileInputLabel.style.backgroundColor = '#f8f8f8';
        });
        
        fileInputLabel.addEventListener('dragleave', () => {
            fileInputLabel.style.borderColor = '#dbdbdb';
            fileInputLabel.style.backgroundColor = 'transparent';
        });
        
        fileInputLabel.addEventListener('drop', (e) => {
            e.preventDefault();
            fileInputLabel.style.borderColor = '#dbdbdb';
            fileInputLabel.style.backgroundColor = 'transparent';
            
            if (e.dataTransfer.files.length > 0) {
                const file = e.dataTransfer.files[0];
                if (file.type.match('image.*')) {
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        newProfilePicPreview = event.target.result;
                        renderPreview();
                    };
                    reader.readAsDataURL(file);
                }
            }
        });
        
        // Funcionalidade de posts
        postInput.addEventListener('input', () => {
            updatePostButton();
        });
        
        photoBtn.addEventListener('click', () => {
            mediaInput.accept = 'image/*';
            mediaInput.click();
        });
        
        videoBtn.addEventListener('click', () => {
            mediaInput.accept = 'video/*';
            mediaInput.click();
        });
        
        mediaInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                selectedMedia = e.target.files[0];
                updatePostButton();
                
                // Mostrar preview da mídia selecionada
                const reader = new FileReader();
                reader.onload = function(event) {
                    alert(`Mídia selecionada: ${selectedMedia.name}\nTipo: ${selectedMedia.type}`);
                };
                reader.readAsDataURL(selectedMedia);
            }
        });
        
        function updatePostButton() {
            postBtn.disabled = postInput.value.trim() === '' && !selectedMedia;
        }
        
        postBtn.addEventListener('click', () => {
            const postText = postInput.value.trim();
            
            if (postText || selectedMedia) {
                const newPost = {
                    id: Date.now(),
                    username: currentUser.name,
                    userPic: currentUser.profilePic,
                    text: postText,
                    media: selectedMedia ? {
                        type: selectedMedia.type.includes('image') ? 'image' : 'video',
                        name: selectedMedia.name
                    } : null,
                    likes: 0,
                    liked: false,
                    comments: [],
                    timestamp: new Date().toISOString()
                };
                
                posts.unshift(newPost);
                renderPosts();
                
                // Resetar o formulário
                postInput.value = '';
                selectedMedia = null;
                postBtn.disabled = true;
                mediaInput.value = '';
                
                if (noPosts) {
                    noPosts.style.display = 'none';
                }
            }
        });
        
        // Função para renderizar os posts
        function renderPosts() {
            postsContainer.innerHTML = '';
            
            if (posts.length === 0) {
                noPosts.style.display = 'block';
                return;
            }
            
            posts.forEach(post => {
                const postElement = document.createElement('div');
                postElement.className = 'post';
                
                let mediaContent = '';
                if (post.media) {
                    if (post.media.type === 'image') {
                        mediaContent = `
                            <div style="background-color: #f0f0f0; width: 100%; height: 300px; display: flex; align-items: center; justify-content: center;">
                                <p>[Imagem: ${post.media.name}]</p>
                            </div>
                        `;
                    } else {
                        mediaContent = `
                            <div style="background-color: #f0f0f0; width: 100%; height: 300px; display: flex; align-items: center; justify-content: center;">
                                <p>[Vídeo: ${post.media.name}]</p>
                            </div>
                        `;
                    }
                }
                
                postElement.innerHTML = `
                    <button class="delete-post-btn" data-post-id="${post.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                    <div class="post-header">
                        <img src="${post.userPic}" alt="Foto de perfil" class="post-profile-pic">
                        <span class="post-username">${post.username}</span>
                    </div>
                    ${mediaContent}
                    ${post.text ? `<div class="post-text">${post.text}</div>` : ''}
                    <div class="post-footer">
                        <div class="post-actions-footer">
                            <button class="post-action like-btn ${post.liked ? 'liked' : ''}" data-post-id="${post.id}">
                                <i class="far fa-heart"></i>
                            </button>
                            <button class="post-action" data-post-id="${post.id}">
                                <i class="far fa-comment"></i>
                            </button>
                            <button class="post-action" data-post-id="${post.id}">
                                <i class="far fa-share-square"></i>
                            </button>
                        </div>
                    </div>
                `;
                
                postsContainer.appendChild(postElement);
            });
            
            // Adicionar event listeners para os botões de like
            document.querySelectorAll('.like-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const postId = parseInt(btn.getAttribute('data-post-id'));
                    const post = posts.find(p => p.id === postId);
                    
                    if (post) {
                        post.liked = !post.liked;
                        post.likes += post.liked ? 1 : -1;
                        btn.classList.toggle('liked');
                        btn.innerHTML = `<i class="fa${post.liked ? 's' : 'r'} fa-heart"></i>`;
                    }
                });
            });
            
            // Adicionar event listeners para os botões de deletar
            document.querySelectorAll('.delete-post-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const postId = parseInt(btn.getAttribute('data-post-id'));
                    showDeleteConfirmation(postId);
                });
            });
        }
        
        function showDeleteConfirmation(postId) {
            postToDelete = postId;
            confirmDeleteModal.style.display = 'flex';
        }
        
        cancelDeleteBtn.addEventListener('click', () => {
            confirmDeleteModal.style.display = 'none';
            postToDelete = null;
        });
        
        confirmDeleteBtn.addEventListener('click', () => {
            if (postToDelete) {
                posts = posts.filter(post => post.id !== postToDelete);
                renderPosts();
                
                if (posts.length === 0) {
                    noPosts.style.display = 'block';
                }
            }
            confirmDeleteModal.style.display = 'none';
            postToDelete = null;
        });
        
        // Inicializar a página
        renderPosts();

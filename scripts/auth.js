//Author: Gurman Brar
//University Of Waterloo BME 24

(function(){
    var firebaseConfig = {
    apiKey: "AIzaSyBAYCXhNbih56NkTY04FP6oY7jgGUJa2gQ",
    authDomain: "project-uni-90f51.firebaseapp.com",
    databaseURL: "https://project-uni-90f51.firebaseio.com",
    projectId: "project-uni-90f51",
    storageBucket: "project-uni-90f51.appspot.com",
    messagingSenderId: "361505662901",
    appId: "1:361505662901:web:f4e00a1c752b5b4d561bfc",
    measurementId: "G-JEGV1WFRQ1"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  firebase.analytics();
})();

const signupUsername = document.getElementById('signupModalUsername');
const signupEmail = document.getElementById('signupModalEmail');
const signupPassword = document.getElementById('signupModalPassword');
const signupSchool = document.getElementById('signupModalSchool');
const signupBtn = document.getElementById('signupModalBtn');
const signupModal = document.getElementById('signup-modal');
const loginEmail = document.getElementById('loginModalEmail');
const loginPass = document.getElementById('loginModalPassword');
const loginBtn = document.getElementById('loginModalBtn');

const logoutBtn = document.getElementById('logout-btn');
const navlogindiv = document.querySelector('.nav-userBtns');
const logoutdiv = document.querySelector('.nav-logoutButton');

const welcomeDiv = document.querySelector('.welcome');
const postTitleInput = document.getElementById("postTitleInput");
const postSubjectInput = document.getElementById("postSubjectInput");
const postTagsInput = document.getElementById("postTagsInput");
const postBodyInput = document.getElementById('postBodyInput');
const submitPostBtn = document.getElementById('submitPostBtn');

const commentTitleInput = document.getElementById('commentTitleInput');
const commentBodyInput = document.getElementById('commentBodyInput');
const submitComment = document.getElementById('submitCommentBtn');

const filterSearch = document.getElementById('filterSearchInput');
const filterSearchUni = document.getElementById('filterSearchUni');

const auth = firebase.auth();
const database = firebase.database();
const userRef = database.ref('users');
const postRef = database.ref('posts');
let posts = [];
let curUser;


filterSearch.addEventListener('keyup', (e) =>{
    if(e.target.value === ""){
        addPost(posts);
    }else{
        let filtered = []
        posts.forEach(post =>{
            if(post.tags.includes(e.target.value.toLowerCase())){
                filtered.push(post);
            }
        })
        addPost(filtered);
    }
})


filterSearchUni.addEventListener('keyup', (e) =>{
    if(e.target.value === ""){
        addPost(posts);
    }else{
        let filtered = [];
        posts.forEach(post =>{
            if(post.school.replace(/ +/g, "").toLowerCase().includes(e.target.value.replace(/ +/g, "").toLowerCase())){
                filtered.push(post);
            }
        })
        addPost(filtered);
    }
})


submitComment.addEventListener('click', (e) =>{
    e.preventDefault();
    if(commentTitleInput.value === "" || commentBodyInput.value === ""){
        showAlertComment("Please fill in all of the fields", 'alert-danger');
    }else{
        const commentTitle = commentTitleInput.value.replace(/ +/g, "").toLowerCase();
        let curPost;
        posts.forEach(post =>{
            if(post.title.replace(/ +/g, "").toLowerCase() === commentTitle){
                curPost = post;
            }
        })
        
        if(curPost.comments.includes("No comments")){
            curPost.comments = [];
            curPost.comments.push(commentBodyInput.value);
        }else{
            curPost.comments.push(commentBodyInput.value);
        }
        postRef.child(commentTitle).update(curPost);
        clearCommentsInput();
        showAlertComment("Comment added!", 'alert-success');
    }
})


function clearCommentsInput(){
    commentTitleInput.value = "";
    commentBodyInput.value = "";
}

submitPostBtn.addEventListener('click', (e) =>{
    console.log(curUser);
    e.preventDefault();
    if(postTitleInput.value === "" || postBodyInput.value === ""){
        showAlertPost("Please include a title and a body", "alert-danger");
    }else{
        if(postTitleInput.value.length > 30){
            showAlertPost("Title is too long", 'alert-warning');
        }else{
            const tagsArr = postTagsInput.value.split(',');
            const newPost = {
                title: postTitleInput.value,
                subject: postSubjectInput.value,
                tags: tagsArr,
                body: postBodyInput.value,
                comments: ["No comments"],
                username: curUser.username,
                school: curUser.school
            }
            const apititle = newPost.title.replace(/ +/g, "").toLowerCase();

            postRef.child(apititle).set(newPost)
            .then(() =>{
                clearPostInput();
                showAlertPost("Post has been submited and published", "alert-success");
            })
            .catch(err =>{
                showAlertPost(err.message, 'alert-danger');
            })
        }
    }
})


postRef.on('value', (snapshot) =>{
    if(snapshot.val() === null){
        posts = [];
    }else{
        posts = [];
        const keys = Object.keys(snapshot.val());
        keys.forEach(key =>{
            posts.push(snapshot.val()[key]);
        })

        addPost(posts);
    }
})

auth.onAuthStateChanged(user =>{
    if(user){
        navUI(false);
        matchUser(user);
        accountModal();
    
    }else{
        navUI(true);
    }
})



signupBtn.addEventListener('click', (e) =>{
    e.preventDefault();

    if(signupUsername.value === "" || signupEmail.value === "" || signupPassword.value === "" || signupSchool.value === ""){
        showAlertSignup("Please fill in all of the fields!", "alert-danger")
    }else{
        const user ={
            username: signupUsername.value,
            email: signupEmail.value,
            school: signupSchool.value
        }

        auth.createUserWithEmailAndPassword(user.email, signupPassword.value)
        .then(cred =>{
            userRef.child(user.username).set(user)
            .then(() =>{
                $('#signup-modal').modal('hide');
                clearSignupFields();
            })
            .catch(err =>{
                showAlertSignup(err.message, 'alert-danger');
            });

        })
        .catch(err =>{
            showAlertSignup(err.message, "alert-danger");
        });
    }
});

logoutBtn.addEventListener('click', (e) =>{
    e.preventDefault();

    auth.signOut()
    .then(() =>{
        null;
    })
    .catch(err =>{
        alert(err.message);
    });
});

loginBtn.addEventListener('click', (e) =>{
    e.preventDefault();

    if(loginEmail.value === "" || loginPass.value === ""){
        showAlertLogin('Please fill in all of the fields!', 'alert-danger');
    }else{
        auth.signInWithEmailAndPassword(loginEmail.value, loginPass.value)
        .then(cred =>{
            $('#login-modal').modal('hide');
            clearLoginFields();
        })
        .catch(err =>{
            showAlertLogin(err.message, 'alert-danger');
        });
    }
});

function showAlertLogin(message, className){
    const alert = document.createElement('div');
    alert.className = "alert text-center " + className;
    alert.appendChild(document.createTextNode(message));
    const body = document.querySelector(`.login-body`);
    const form = document.querySelector(`.login-form`);

    body.insertBefore(alert, form);
    setTimeout(() =>{
        alert.remove();
    }, 3000);
};

function showAlertSignup(message, className){
    const alert = document.createElement('div');
    alert.className = "alert text-center " + className;
    alert.appendChild(document.createTextNode(message));
    const body = document.querySelector(`.signup-body`);
    const form = document.querySelector(`.signup-form`);

    body.insertBefore(alert, form);
    setTimeout(() =>{
        alert.remove();
    }, 3000);
};

function clearSignupFields(){
    signupSchool.value = "";
    signupEmail.value = "";
    signupPassword.value = "";
    signupUsername.value = "";
};

function clearLoginFields(){
    loginEmail.value = "";
    loginPass.value = "";
}


function navUI(state){
    const top = document.querySelector('.top');
    const bottom = document.querySelector('.bottom');
    const newPostDiv = document.querySelector('.new-post');
    const postContainer = document.querySelector('.posts-display');
    const postCommentContainer = document.querySelector('.new-comment');
    const searchPosts = document.querySelector('.search-posts');

    if(state){
        navlogindiv.style.display = 'block';
        logoutdiv.style.display = 'none';

        top.style.display = 'block';
        bottom.style.display = 'block';

        welcomeDiv.style.display = 'none';

        newPostDiv.style.display = 'none';

        postContainer.style.display = 'none';

        postCommentContainer.style.display = 'none';

        searchPosts.style.display = 'none';

    }else{
        navlogindiv.style.display = 'none';
        logoutdiv.style.display = 'block';

        top.style.display = 'none';
        bottom.style.display = 'none';

        welcomeDiv.style.display = 'block';

        newPostDiv.style.display = 'block';

        postContainer.style.display = 'block';

        postCommentContainer.style.display = 'block';

        searchPosts.style.display = 'block';

    }
}

function matchUser(user){
    userRef.on('value', snap =>{
        const data = snap.val();
        const users = Object.keys(data);
        const cur = user.email;
        const welcomeDiv = document.getElementById('welcome-text');

        if(welcomeDiv.innerHTML !== "Welcome "){
            welcomeDiv.innerHTML = "Welcome ";
        }

        users.map(user =>{
            if(data[user].email === cur){
                welcomeDiv.appendChild(document.createTextNode(data[user].username));
                curUser = data[user];
            }
        })
    })
}


function showAlertPost(message, className){
    const alert = document.createElement('div');
    alert.className = "alert text-center " + className;
    alert.appendChild(document.createTextNode(message));
    const body = document.getElementById("post-form-body")
    const form = document.getElementById("post-form");

    body.insertBefore(alert, form);
    setTimeout(() =>{
        alert.remove();
    }, 3000);
}

function showAlertComment(message, className){
    const alert = document.createElement('div');
    alert.className = "alert text-center " + className;
    alert.appendChild(document.createTextNode(message));
    const body = document.getElementById("post-comment-body")
    const form = document.getElementById("post-comment");

    body.insertBefore(alert, form);
    setTimeout(() =>{
        alert.remove();
    }, 3000);
}

function clearPostInput(){
    postTitleInput.value = "";
    postSubjectInput.value = "";
    postTagsInput.value = "";
    postBodyInput.value = "";
}

function addPost(data){
    if(data.length === 0){
        const postContainer = document.querySelector('.posts-display');
        postContainer.innerHTML = "";
        postContainer.innerHTML = `
            <div class="container text-center">
                <h1 class="heading-4">There are no posts</h1>
            </div>
        `;
    }else{
        const postContainer = document.querySelector('.posts-display');
        postContainer.innerHTML = "";

        data.forEach(post =>{
            const postDiv = document.createElement('div');
            postDiv.className = "jumbotron mt-3";
            postDiv.id = post.title;
            postDiv.innerHTML = `

                    <h1 class="display-4">${post.title}</h1>
                    <p>${post.subject}</p>
                    <p>Tags: ${post.tags.map(tag =>{return " " + tag ;})}</p>
                    <P class="lead">${post.body}</P>
                    <hr class="my-4">
                    <p>By: ${post.username}</p>
                    <p>School: ${post.school}</p>
                    <hr class="my-4">
                    <div class="container mt-3">
                        <p class="lead">Comments: </p>
                        <ul class="list-group" id="comments-list">
                            ${post.comments.map((comment,i) =>{
                                return(
                                    `<li class="list-group-item" key=${i}>${comment}</li>`
                                )
                            })}
                        </ul>
                    </div>
                `;

            postContainer.appendChild(postDiv);
        })
    }
}

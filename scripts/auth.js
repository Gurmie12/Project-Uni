//Init
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

//Main page components
const signupUsername = document.getElementById('signupModalUsername');
const signupEmail = document.getElementById('signupModalEmail');
const signupPassword = document.getElementById('signupModalPassword');
const signupSchool = document.getElementById('signupModalSchool');
const signupBtn = document.getElementById('signupModalBtn');
const signupModal = document.getElementById('signup-modal');
const loginEmail = document.getElementById('loginModalEmail');
const loginPass = document.getElementById('loginModalPassword');
const loginBtn = document.getElementById('loginModalBtn');

//Nav bar components
const logoutBtn = document.getElementById('logout-btn');
const navlogindiv = document.querySelector('.nav-userBtns');
const accountdiv = document.querySelector('.nav-accountButton');
const logoutdiv = document.querySelector('.nav-logoutButton');

//Posts page components
const welcomeDiv = document.querySelector('.welcome');
const postTitleInput = document.getElementById("postTitleInput");
const postSubjectInput = document.getElementById("postSubjectInput");
const postTagsInput = document.getElementById("postTagsInput");
const postBodyInput = document.getElementById('postBodyInput');
const submitPostBtn = document.getElementById('submitPostBtn');

//Comments components
const commentInput = document.getElementById('commentTextInput');
const submitCommentBtn = document.getElementById('submitCommentBtn');

//Firebase database and authorization objects
const auth = firebase.auth();
const database = firebase.database();
const userRef = database.ref('users');
const postRef = database.ref('posts');



submitCommentBtn.addEventListener('click', (e) =>{
    e.preventDefault();
    console.log(commentInput.value);
})


submitPostBtn.addEventListener('click', (e) =>{
    e.preventDefault();
    if(postTitleInput.value === "" || postBodyInput.value === ""){
        showAlertPost("Please include a title and a body", "alert-danger");
    }else{
        if(postTitleInput.value.length > 30){
            showAlertPost("Title is too long", 'alert-warning');
        }else{
            const tagsArr = postTagsInput.value.split(',');
            const newPost = {
                title: postBodyInput.value,
                subject: postSubjectInput.value,
                tags: tagsArr,
                body: postBodyInput.value,
                comments: []
            }

            postRef.child(newPost.title).set(newPost)
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
    addPost(snapshot.val());
})


auth.onAuthStateChanged(user =>{
    if(user){
        navUI(false);
        matchUser(user);

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
        // Add back login and signup buttons
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

    if(state){
        navlogindiv.style.display = 'block';
        accountdiv.style.display ='none';
        logoutdiv.style.display = 'none';

        top.style.display = 'block';
        bottom.style.display = 'block';

        welcomeDiv.style.display = 'none'

        newPostDiv.style.display = 'none'

        postContainer.style.display = 'none';

    }else{
        navlogindiv.style.display = 'none';
        accountdiv.style.display ='block';
        logoutdiv.style.display = 'block';

        top.style.display = 'none';
        bottom.style.display = 'none';

        welcomeDiv.style.display = 'block'

        newPostDiv.style.display = 'block'

        postContainer.style.display = 'block';

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

function clearPostInput(){
    postTitleInput.value = "";
    postSubjectInput.value = "";
    postTagsInput.value = "";
    postBodyInput.value = "";
}

function addPost(data){
    const posts = Object.keys(data);
    const postContainer = document.querySelector('.posts-display');
    postContainer.innerHTML = "";

    posts.map((post) =>{
        const curPost = data[post];
        const postDiv = document.createElement('div');
        postDiv.className = "jumbotron mt-3";
        postDiv.id = curPost.title;
        postDiv.innerHTML = `

            <h1 class="display-4">${curPost.title}</h1>
            <p class="lead">${curPost.subject}</p>
            <p class="lead"> ${curPost.tags.map(tag =>{return tag;})}</p>
            <hr class="my-4">
            <P>${curPost.body}</P>
            <button type="button" class="btn btn-dark comment" id="comment-${curPost.title}" data-toggle="modal" data-target="#comment-modal">Comment</button>
            <div class="container comments mt-3">
            </div>

        `;

        postContainer.appendChild(postDiv);
    })
}







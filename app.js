const form = document.getElementById("registerForm");

const name = document.getElementById("name");
const email = document.getElementById("email");
const password = document.getElementById("password");
const mobile = document.getElementById("mobile");

const togglePassword = document.getElementById("togglePassword");
const success = document.getElementById("success");

togglePassword.addEventListener("click", () => {

    if(password.type === "password"){
        password.type = "text";
        togglePassword.innerHTML = "🙈";
    }
    else{
        password.type = "password";
        togglePassword.innerHTML = "👁";
    }

});

form.addEventListener("submit", function(e){

    e.preventDefault();

    let valid = true;

    document.querySelectorAll(".error").forEach(el=>{
        el.innerHTML="";
    });

    success.innerHTML="";

    // Name
    if(name.value.trim()===""){
        showError(name,"Name is required");
        valid=false;
    }

    // Email
    const emailPattern=/^[^ ]+@[^ ]+\.[a-z]{2,3}$/;

    if(!email.value.match(emailPattern)){
        showError(email,"Enter a valid email");
        valid=false;
    }

    // Password
    if(password.value.length<6){
        showError(password,"Password must be at least 6 characters");
        valid=false;
    }

    // Mobile
    const mobilePattern=/^[0-9]{10}$/;

    if(!mobile.value.match(mobilePattern)){
        showError(mobile,"Enter valid 10 digit mobile number");
        valid=false;
    }

    if(valid){
        success.innerHTML="Registration Successful 🎉";
        form.reset();
    }

});

function showError(input,message){
    input.parentElement.querySelector(".error").innerHTML=message;
}
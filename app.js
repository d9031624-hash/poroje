let currentUser = null;
let currentChatUser = "test"; // برای تست اولیه

// ورود و ثبت نام
document.getElementById('login-btn').onclick = () => {
  document.getElementById('auth-form').style.display = 'block';
};
document.getElementById('register-btn').onclick = () => {
  document.getElementById('auth-form').style.display = 'block';
};

document.getElementById('submit-btn').onclick = async () => {
  const phone = document.getElementById('phone').value;
  const password = document.getElementById('password').value;

  const res = await fetch('/api/login', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({phone,password})
  });
  const data = await res.json();
  if(data.success){
    currentUser = phone;
    window.location.href='chat.html';
  } else {
    alert(data.message);
  }
};

// ارسال پیام
document.getElementById('send-btn')?.addEventListener('click', async ()=>{
    const text = document.getElementById('msg-text').value;
    const fileInput = document.getElementById('msg-image');
    const formData = new FormData();
    formData.append('sender', currentUser);
    formData.append('receiver', currentChatUser);
    formData.append('text', text);
    if(fileInput.files[0]){
        compressImage(fileInput.files[0], 200, blob=>{
            formData.append('file', new File([blob], fileInput.files[0].name, {type:'image/jpeg'}));
            fetch('/api/send-message', {method:'POST', body: formData})
            .then(res=>res.json()).then(data=>{loadMessages(currentUser,currentChatUser)});
        });
    } else {
        fetch('/api/send-message', {method:'POST', body: formData})
        .then(res=>res.json()).then(data=>{loadMessages(currentUser,currentChatUser)});
    }
});

// دریافت و نمایش پیام‌ها
async function loadMessages(user, other){
    const res = await fetch(`/api/get-messages/${user}/${other}`);
    const data = await res.json();
    const messagesDiv = document.getElementById('messages');
    messagesDiv.innerHTML='';
    data.messages.forEach(msg=>{
        const div = document.createElement('div');
        div.classList.add('message');
        div.innerHTML=`
            <div class="msg-user-pic"><img src="${msg.sender_profile_pic||'default.png'}" width="30" height="30"></div>
            <div class="msg-text">${msg.text}${msg.image?'<br><img src="'+msg.image+'">':''}</div>
        `;
        messagesDiv.appendChild(div);
    });
}

// حذف پیام‌ها
async function deleteMessage(timestamp){
    await fetch('/api/delete-message',{
        method:'POST',
        body:new URLSearchParams({sender:currentUser, receiver:currentChatUser, timestamp})
    });
    loadMessages(currentUser,currentChatUser);
}
document.getElementById('delete-all')?.addEventListener('click', async ()=>{
    await fetch('/api/delete-all',{
        method:'POST',
        body:new URLSearchParams({sender:currentUser, receiver:currentChatUser})
    });
    loadMessages(currentUser,currentChatUser);
});

// فشرده‌سازی عکس
function compressImage(file,maxSizeKB,callback){
    const reader=new FileReader();
    reader.onload=function(event){
        const img=new Image();
        img.src=event.target.result;
        img.onload=function(){
            const canvas=document.createElement('canvas');
            const scale=Math.sqrt(maxSizeKB*1024/file.size);
            canvas.width=img.width*scale;
            canvas.height=img.height*scale;
            const ctx=canvas.getContext('2d');
            ctx.drawImage(img,0,0,canvas.width,canvas.height);
            canvas.toBlob(callback,'image/jpeg',0.7);
        }
    }
    reader.readAsDataURL(file);
}

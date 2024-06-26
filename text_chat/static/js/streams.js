const APP_ID = sessionStorage.getItem('appId')
const TOKEN = sessionStorage.getItem('token')
const CHANNEL = sessionStorage.getItem('room')
let UID = sessionStorage.getItem('UID')
let NAME = sessionStorage.getItem('name')
let call_type = sessionStorage.getItem('callType')


let timerInterval;
let seconds = 0;
let minutes = 0;

const client = AgoraRTC.createClient({mode:'rtc', codec:'vp8'})

if(call_type==='video'){
    let localTracks = []
}
else{
    let localTracks
}
let remoteUsers = {}

let joinAndDisplayLocalStream = async () => {
    document.getElementById('room-name').innerText = CHANNEL

    client.on('user-published', handleUserJoined)
    client.on('user-left', handleUserLeft)

    try{
        UID = await client.join(APP_ID, CHANNEL, TOKEN, UID)
    }catch(error){
        console.error(error)
        window.close();
    }

    if(call_type==='video'){
        localTracks = await AgoraRTC.createMicrophoneAndCameraTracks()
    }
    else{
        localTracks = await AgoraRTC.createMicrophoneAudioTrack()
    }
//    try {
//      const localTracks = await AgoraRTC.createMicrophoneAndCameraTracks();
//      // Proceed with using the localTracks (e.g., play video/audio)
//    }catch (error) {
//       console.error("Error accessing microphone and camera:", error);
//    }

    let member = await createMember()

    let player = `<div  class="video-container" id="user-container-${UID}">
                     <div class="video-player" id="user-${UID}"></div>
                     <div class="username-wrapper"><span class="user-name">${member.name}</span></div>
                  </div>`

    document.getElementById('video-streams').insertAdjacentHTML('beforeend', player)
    if(call_type==='video'){
        localTracks[1].play(`user-${UID}`)
        await client.publish([localTracks[0], localTracks[1]])
    }
    else{
        localTracks.play(`user-${UID}`)
        await client.publish(localTracks)
    }
}

let handleUserJoined = async (user, mediaType) => {
    remoteUsers[user.uid] = user
    await client.subscribe(user, mediaType)



    if (call_type === 'video'){
        if (mediaType === 'video'){
            let player = document.getElementById(`user-container-${user.uid}`)
            if (player != null){
                player.remove()
            }

            let member = await getMember(user)

            player = `<div  class="video-container" id="user-container-${user.uid}">
                <div class="video-player" id="user-${user.uid}"></div>
                <div class="username-wrapper"><span class="user-name">${member.name}</span></div>
            </div>`

            document.getElementById('video-streams').insertAdjacentHTML('beforeend', player)
            user.videoTrack.play(`user-${user.uid}`)
        }

        if (mediaType === 'audio'){
            user.audioTrack.play()
        }
    }
    else{

        clearInterval(timerInterval);
        timerInterval = setInterval(updateTimer, 1000);

        if (mediaType === 'video'){
            let player = document.getElementById(`user-container-${user.uid}`)
            if (player != null){
                player.remove()
            }

            let member = await getMember(user)

            player = `<div  class="video-container" id="user-container-${user.uid}">
                <div class="video-player" id="user-${user.uid}"></div>
                <div class="username-wrapper"><span class="user-name">${member.name}</span></div>
            </div>`

            document.getElementById('video-streams').insertAdjacentHTML('beforeend', player)
            user.videoTrack.play(`user-${user.uid}`)
        }

        if (mediaType === 'audio'){


            let player = document.getElementById(`user-container-${user.uid}`)
            if (player != null){
                player.remove()
            }

            let member = await getMember(user)

            player = `<div  class="video-container" id="user-container-${user.uid}">
                <div class="video-player" id="user-${user.uid}"></div>
                <div class="username-wrapper"><span class="user-name">${member.name}</span></div>
            </div>`

            document.getElementById('video-streams').insertAdjacentHTML('beforeend', player)


            user.audioTrack.play(`user-${user.uid}`)
        }
    }
}

let handleUserLeft = async (user) => {
    delete remoteUsers[user.uid]
    document.getElementById(`user-container-${user.uid}`).remove()
}

let leaveAndRemoveLocalStream = async () => {
    if(call_type==='video'){
        for (let i=0; localTracks.length > i; i++){
            localTracks[i].stop()
            localTracks[i].close()
        }
    }
    else{
        localTracks.stop()
        localTracks.close()
    }

    await client.leave()
    //This is somewhat of an issue because if user leaves without actaull pressing leave button, it will not trigger
    deleteMember()
    window.close();
}

let toggleCamera = async (e) => {
    console.log('TOGGLE CAMERA TRIGGERED')
    if(call_type==='video'){
        if(localTracks[1].muted){
            await localTracks[1].setMuted(false)
            e.target.style.backgroundColor = '#fff'
        }else{
            await localTracks[1].setMuted(true)
            e.target.style.backgroundColor = 'rgb(255, 80, 80, 1)'
        }
    }
}

let toggleMic = async (e) => {
    console.log('TOGGLE MIC TRIGGERED')
    if(call_type==='video'){
        if(localTracks[0].muted){
            await localTracks[0].setMuted(false)
            e.target.style.backgroundColor = '#fff'
        }else{
            await localTracks[0].setMuted(true)
            e.target.style.backgroundColor = 'rgb(255, 80, 80, 1)'
        }
    }
    else{
        if(localTracks.muted){
            await localTracks.setMuted(false)
            e.target.style.backgroundColor = '#fff'
        }else{
            await localTracks.setMuted(true)
            e.target.style.backgroundColor = 'rgb(255, 80, 80, 1)'
        }
    }
}

function updateTimer() {
  seconds++;
  if (seconds >= 60) {
    seconds = 0;
    minutes++;
  }
  document.getElementById('timer').innerText = formatTime(minutes) + ':' + formatTime(seconds);
}

function formatTime(time) {
  return time < 10 ? '0' + time : time;
}

let createMember = async () => {
    let response = await fetch('/call/create_member/', {
        method:'POST',
        headers: {
            'Content-Type':'application/json'
        },
        body:JSON.stringify({'name':NAME, 'room_name':CHANNEL, 'UID':UID})
    })
    let member = await response.json()
    return member
}


let getMember = async (user) => {
    let response = await fetch(`/call/get_member/?UID=${user.uid}&room_name=${CHANNEL}`)
    let member = await response.json()
    return member
}

let deleteMember = async () => {
    let response = await fetch('/call/delete_member/', {
        method:'POST',
        headers: {
            'Content-Type':'application/json'
        },
        body:JSON.stringify({'name':NAME, 'room_name':CHANNEL, 'UID':UID})
    })
    let member = await response.json()
}

window.addEventListener("beforeunload",deleteMember);

joinAndDisplayLocalStream()

document.getElementById('leave-btn').addEventListener('click', leaveAndRemoveLocalStream)
if(call_type==='video'){
    document.getElementById('camera-btn').addEventListener('click', toggleCamera)
}
document.getElementById('mic-btn').addEventListener('click', toggleMic)
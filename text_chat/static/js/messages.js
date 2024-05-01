
let input_message = $('#input-message')
let message_body = $('.chat-history')
let last_seen_body = $('.chat-about')
let send_message_form = $('#send-message-form')
const USER_ID = $('#logged-in-user').val()
const now = new Date();
const hours = now.getHours();
const minutes = now.getMinutes();
console.log(USER_ID)

let loc = window.location
let wsStart = 'ws://'

if(loc.protocol === 'https'){
    wsStart = 'wss://'
}

let endpoint = wsStart + loc.host + loc.pathname

var socket = new WebSocket(endpoint)

socket.onopen = async function(e){

    console.log('open', e)
    let now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    get_h_m(hours,minutes)
    let active_time = last_seen(hours,minutes)
    console.log(active_time)
    active_status(active_time)

    send_message_form.on('submit', function(e){
        e.preventDefault()
        let connection_time = getCurrentTime()
        let message = input_message.val()
//        let user_id = get_active_user_id
        let send_to
        if(USER_ID == 1){
            send_to = 2
        }
        else{
            send_to = 1
        }

        let data = {
            'connection_time': connection_time,
            'message': message,
            'sent_by': USER_ID,
            'send_to': send_to
        }
        data = JSON.stringify(data)
        socket.send(data)
        $(this)[0].reset()
    })
}

socket.onmessage = async function(e){
    console.log('message', e)
    let data = JSON.parse(e.data)
    let message = data['message']
    sent_user = data['sent_by']
    let time =getCurrentTime()
    newMessage(message, sent_user, time)
    console.log('get_h_m',hours,minutes)
    let active_time = last_seen(hours,minutes)
    console.log(active_time)
    active_status(active_time)

}

socket.onerror = async function(e){
    console.log('error', e)
}

socket.onclose = async function(e){
    console.log('close', e)
}

function get_h_m(h,m){
    let hm = [h,m];
    return hm
}

function getCurrentTime() {
  var now = new Date();
  var date = now.getDate();
  var month = now.getMonth() + 1;
  var year = now.getFullYear();
  var hours = now.getHours();
  var minutes = now.getMinutes();
  var time =  month + '-' + date + '-' + year + ', ' + hours + ':' + (minutes < 10 ? '0' + minutes : minutes);
  return time;
}



var time = getCurrentTime()
console.log('time',time)
function last_seen(sh,sm){
    var now = new Date();
    var hours = now.getHours();
    var minutes = now.getMinutes();

    var passed_minutes =  minutes-sm
    var passed_hours =  hours-sh
    console.log(passed_minutes)
    console.log(passed_hours)
    console.log(typeof passed_minutes)
    console.log(typeof passed_minutes)
    if(passed_minutes<1){
    return 'now'
    }
    else{
    return passed_minutes +' '+ 'minutes ago'
    }
}


function active_status(time){
    let status;
    status = `
        <small>Last seen: ${time}</small>
    `
    last_seen_body.empty().append($(status))
}

function newMessage(message, sent_user,time) {
	if ($.trim(message) === '') {
		return false;
	}
	let message_element;
	if(sent_user == USER_ID){
	    message_element = `
	    <ul class="m-b-0">
	                        <li class="clearfix">
                                <div class="message-data text-right">
                                    <span class="message-data-time">${time}</span>
                                    <img src="https://bootdey.com/img/Content/avatar/avatar7.png" alt="avatar">
                                </div>
                            </li>
                            <li class="clearfix">
                            <!-- <img src="https://bootdey.com/img/Content/avatar/avatar7.png" alt="avatar"> -->
                                <div class="message-data text-right">

                                <div class="message my-message float-right" data-mydata="message">${message}</div>

                                </div>

                            </li>

                        </ul>
	    `
	}
	else{
	    message_element = `
			<ul class="m-b-0">
			                <li class="clearfix">
                                <div class="message-data text-left float-left">
                                    <img src="https://bootdey.com/img/Content/avatar/avatar7.png" alt="avatar">
                                    <span class="message-data-time">${time}</span>

                                </div>
                            </li>
                            <li class="clearfix">
                            <!-- <img src="https://bootdey.com/img/Content/avatar/avatar7.png" alt="avatar"> -->
                                <div class="message-data text-right">

                                <div class="message my-message float-left" data-mydata="message">${message}

                                </div>

                                </div>

                            </li>
                        </ul>
	    `
	}


	message_body.append($(message_element))
	last_seen_body.append($(status))
    message_body.animate({
        scrollTop: $(document).height()
    }, 100);
	input_message.val(null);
}


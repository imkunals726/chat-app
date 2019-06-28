socket = io( )


const $sendLocationButton = document.querySelector( "#send-location" )
const $messageForm		  = document.querySelector("#form")
const $messageFormInput	  = $messageForm.querySelector( "input" )
const $messageFormSubmit  = $messageForm.querySelector("#submit-form" )
const $messages 		  = document.querySelector( "#messages")
const template			  = document.querySelector("#message-template" ).innerHTML
const locationTemplate    = document.querySelector( "#location-template" ).innerHTML
const sidebarTemplate	  = document.querySelector("#sidebar-template" ).innerHTML
const $sidebar 			  = document.querySelector("#sidebar" )

const autoscroll = ()=> {
	const $newMessage = $messages.lastElementChild

	const newMessageStyles = getComputedStyle($newMessage )
	const newMessageMargin = parseInt( newMessageStyles.marginBottom )
	const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

	const visibleHeight	   = $messages.offsetHeight

	const containerHeight  = $messages.scrollHeight

	const scrollOffset	   = $messages.scrollTop + visibleHeight

	if( containerHeight - newMessageHeight <= scrollOffset){
		$messages.scrollTop = $messages.scrollHeight
	}
}

socket.on( 'roomData' , ( { room , users , username } ) =>{
	const html = Mustache.render( sidebarTemplate , { room , users , username } )
	$sidebar.innerHTML = html
} )

const queryParms = Qs.parse( location.search , { ignoreQueryPrefix : true })

console.log( queryParms )
socket.emit( 'join' , queryParms , ( error ) =>{

	if( error ){
		alert( error )
		location.href = "/"
	}
} )

socket.on( 'message' , ( message  ) =>{
	//console.log( message )
	const html = Mustache.render( template , { 
			username	: message.username ,
			text 		: message.text,
			createdAt 	: moment( message.createdAt ).format( 'h:mm a') 
	} )
	$messages.insertAdjacentHTML( 'beforeend' , html )
	autoscroll( )
})

socket.on( 'locationMessage' , ( locationMessage )=>{
	//console.log( locationMessage)
	const html = Mustache.render( locationTemplate , { 
		username	: locationMessage.username,
		url 		: locationMessage.url,
		createdAt 	: moment( locationMessage.createdAt ).format( 'h:mm a' )
	} )
	$messages.insertAdjacentHTML( 'beforeend' , html )
})

$messageForm.addEventListener( 'submit' , ( e )=>{

	messageText = e.target.elements.message.value 
	$messageFormSubmit.disabled = true
	
	socket.emit( "sendMessage" , messageText , ( error ) =>{
		$messageFormSubmit.disabled = false
		$messageFormInput.value = ''
		$messageFormInput.focus( )
		if( error ){
			return console.log( 'Profanity is not allowed')
		}
		console.log( "message was delivered")
	} )
	e.preventDefault( )

})

$sendLocationButton.addEventListener( 'click' , ( e ) =>{

	$sendLocationButton.setAttribute("disabled" , "disabled" )

	if( !navigator.geolocation ){
		return alert( "Not supported" )
	}

	navigator.geolocation.getCurrentPosition( ( position  ) =>{
		let { latitude , longitude } = position.coords
		socket.emit( 'sendLocation' , { latitude , longitude } , ( )=>{
			$sendLocationButton.disabled = false
			console.log( "Location Shared")
		} )
	})

})

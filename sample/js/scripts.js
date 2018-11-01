$("#configureButton").click(function(){
    $("#configureModal").modal({
        show: true
    });
});

$("#bugButton").click(function(){
  $("#bugModal").modal({
    show: true
  });
});

function download(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

$("#bugReport").click(function(){
  let x = document.forms[1];
  console.log(x.elements[0].value);
  description = x.elements[0].value;
download("TestRTC.log","{[test]: WebRTC Troubleshooter bug report, [description]: " + description + "}\n\n\n" + micLog + "\n\n"+ networkLog + "\n\n" + connectivityLog + "\n \n" + throughputLog);
});

//global stack variable
let realm = '172.16.16.45';
let impi = 'sipML5';
let impu = 'sip:sipML5@172.16.16.45';
let password = 'test123';
let display_name = 'sipML5';
let websocket_proxy_url = 'wss://172.16.16.45:8089/ws';
let stun_url = "stun:stun.l.google.com:19302";
let micLog = 'MICROPHONE LOGS';
let networkLog = 'NETWORK LOGS';
let connectivityLog = 'CONNECTIVITY LOGS';
let throughputLog = 'THROUGHPUT LOGS';
let description = 'null';


$("#saveConfig").click(function(){
    let x = document.forms[0];
    realm = x.elements[0].value;
    console.log(realm);
    impi = x.elements[1].value;
    console.log(impi);
    impu = x.elements[2].value;
    console.log(impu);
    password = x.elements[3].value;
    console.log(password);
    display_name = x.elements[4].value;
    console.log(display_name);
    websocket_proxy_url = x.elements[5].value;
    console.log(websocket_proxy_url);
    stun_url = x.elements[6].value ? x.elements[6].value: stun_url;
    console.log(stun_url);
});


$("#startTest").click(function(){
let sipStack = null;
let colorMic = null;
let colorNetwork = null;
let colorConnectivity = null;
let colorThroughput = null;

const testRTC = new TestRTC({
  stunURI: stun_url,
}, filter = [TestRTC.TESTS.NETWORKLATENCYRELAY, TestRTC.TESTS.CHECKRESOLUTION240, TestRTC.TESTS.CHECKRESOLUTION480, TestRTC.TESTS.CHECKRESOLUTION720, TestRTC.TESTS.CHECKSUPPORTEDRESOLUTIONS]);

testRTC.onTestReport((suite, test, level, message) => {
  if(suite == 'Microphone'){
    micLog += '\n[' + level + ']: ' + message;
    if(test == 'Audio capture'){
      document.getElementById('audio_capture_result').innerHTML += '</br>' + '[<b>' + level + '</b>]: ' + message;
      if(level == 'error') {
        colorMic = "bg-danger";
      }
      else if(level == 'warning' && colorMic == null) {
        colorMic = 'bg-warning';
      }
      $('#microphone').addClass(colorMic?colorMic:'bg-success');
    }
  }

  if(suite == 'Network') {
    networkLog += '\n[' + level + ']: ' + message;
    if(test == 'Udp enabled'){
      document.getElementById('udp_enabled_result').innerHTML += '</br>' + '[<b>' + level + '</b>]: ' + message;
    }
    if(test == 'Tcp enabled'){
      document.getElementById('tcp_enabled_result').innerHTML += '</br>' + '[<b>' + level + '</b>]: ' + message;
    }
    if(test == 'Ipv6 enabled') {
      document.getElementById('ipv6_enabled_result').innerHTML += '</br>' + '[<b>' + level + '</b>]: ' + message;
    }
    if(level == 'error') {
      colorNetwork = "bg-danger";
    }
    else if(level == 'warning' && colorNetwork == null) {
      console.log("inside network warning");
      colorNetwork = 'bg-warning';
    }
    $('#network').addClass(colorNetwork?colorNetwork:'bg-success');
  }

  if(suite == 'Connectivity') {
    connectivityLog += '\n[' + level + ']: ' + message;
    if(test == 'Reflexive connectivity') {
      document.getElementById('reflexive_connectivity_result').innerHTML += '</br>' + '[<b>' + level + '</b>]: ' + message;
    }
    if(test == 'Host connectivity') {
      document.getElementById('host_connectivity_result').innerHTML += '</br>' + '[<b>' + level + '</b>]: ' + message;
    }
    if(level == 'error') {
      colorConnectivity = "bg-danger";
    }
    else if(level == 'warning' && colorConnectivity == null) {
      colorConnectivity = 'bg-warning';
    }
    $('#connection').addClass(colorConnectivity?colorConnectivity:'bg-success');
  }

  if(suite == 'Throughput') {
    throughputLog += '\n[' + level + ']: ' + message;
    if(test == 'Data throughput') {
      document.getElementById('data_throughput_result').innerHTML += '</br>' + '[<b>' + level + '</b>]: ' + message;
      if(level == 'error') {
        colorThroughput = "bg-danger";
      }
      else if(level == 'warning' && colorThroughput == null) {
        colorThroughput = 'bg-warning';
      }
      $('#throughput').addClass(colorThroughput?colorThroughput:'bg-success');
    }
  }

  if (level === 'info') console.info(`[${suite}-${test}: INFO] ${message}`);
  else if (level === 'warning') console.warn(`[${suite}-${test}: WARN] ${message}`);
  else if (level === 'error') console.error(`[${suite}-${test}: ERROR] ${message}`);
  else if (level === 'success') console.info(`[${suite}-${test}: SUCCESS] ${message}`);
  else console.log(`[${suite}-${test}] ${message}`)
});

testRTC.onGlobalProgress((finished, remaining) => { console.log(`[TestRTC update] ${finished} finished, ${remaining} remaining`)});
testRTC.onTestProgress((suite, test, progress) => { console.log(`[${suite}-${test}] progress: ${progress}`)});
testRTC.onTestResult((suite, test, status) => { 
  if(suite == "Microphone"){
    micLog += '\n[RESULT' + '->' + test+']: ' + status;
  }
  else if(suite == "Network"){
    networkLog += '\n[Result' + '->' + test+']: ' + status;
  }
  else if(suite == "Connectivity") {
    connectivityLog += '\n[Result' + '->' + test+']: ' + status;
  }
  else if(suite == "Throughput") {
    throughputLog += '\n[Result' + '->' + test+']: ' + status;
  }
  console.log(`[${suite}-${test}: RESULT] ${status}`)});
testRTC.onStopped(() => { console.log("Tests stopped") });
testRTC.onComplete(() => { console.log("Tests finished") });

$("#audio_result").click(function(){
  if($('#audio_capture_result').hasClass('d-none')){
    $('#audio_capture_result').removeClass('d-none');
  }
  else {
    $('#audio_capture_result').addClass('d-none');
  }
})

$("#udp_result").click(function(){
  if($('#udp_enabled_result').hasClass('d-none')){
    $('#udp_enabled_result').removeClass('d-none');
  }
  else {
    $('#udp_enabled_result').addClass('d-none');
  }
})

$("#tcp_result").click(function(){
  if($('#tcp_enabled_result').hasClass('d-none')){
    $('#tcp_enabled_result').removeClass('d-none');
  }
  else {
    $('#tcp_enabled_result').addClass('d-none');
  }
})

$("#reflexive_result").click(function(){
  if($('#reflexive_connectivity_result').hasClass('d-none')){
    $('#reflexive_connectivity_result').removeClass('d-none');
  }
  else {
    $('#reflexive_connective_result').addClass('d-none');
  }
})

$("#host_result").click(function(){
  if($('#host_connectivity_result').hasClass('d-none')){
    $('#host_connectivity_result').removeClass('d-none');
  }
  else {
    $('#host_connective_result').addClass('d-none');
  }
})

$("#throughput_result").click(function(){
  if($('#data_throughput_result').hasClass('d-none')){
    $('#data_throughput_result').removeClass('d-none');
  }
  else {
    $('#data_throughput_result').addClass('d-none');
  }
})

$("#ipv6_result").click(function(){
  if($('#ipv6_enabled_result').hasClass('d-none')){
    $('#ipv6_enabled_result').removeClass('d-none');
  }
  else {
    $('#ipv6_enabled_result').addClass('d-none');
  }
})

$("#websoc_support_result").click(function(){
  if($('#websocket_support_result').hasClass('d-none')){
    $('#websocket_support_result').removeClass('d-none');
  }
  else {
    $('#websocket_support_result').addClass('d-none');
  }
})

$("#websoc_connectivity_result").click(function(){
  if($('#websocket_connectivity_result').hasClass('d-none')){
    $('#websocket_connectivity_result').removeClass('d-none');
  }
  else {
    $('#websocket_connectivity_result').addClass('d-none');
  }
})

function testWebsocketSupport(){

  if(window.WebSocket){
    return true;
  }else{
    return false;
  }
}

function stopStack(){
  if(sipStack){
    sipStack.stop();
  }
}

function onSipEventStack(e) {
        
        switch (e.type) {
            case 'started':
                {
                  console.log("Stack Started");
                    // catch exception for IE (DOM not ready)
                    try {
                        // LogIn (REGISTER) as soon as the stack finish starting
                        var oSipSessionRegister = this.newSession('register', {
                            expires: 200,
                            sip_caps: [
                                        { name: '+g.oma.sip-im', value: null },
                                        //{ name: '+sip.ice' }, // rfc5768: FIXME doesn't work with Polycom TelePresence
                                        { name: '+audio', value: null },
                                        { name: 'language', value: '\"en,fr\"' }
                            ]
                        });
                        oSipSessionRegister.register();
                       var callSession = this.newSession('call-audio',{
                         audio_remote: document.getElementById('audio-remote'), 
                         events_listener: { events: '*', listener: onSipEventStack }
                       });                                              
                        callSession.call('100');

                    }
                    catch (e) {
                        console.log("Error = " + e);
                    }
                    break;
                }
            case 'failed_to_start':
                {  
                    console.log("Failed to create stack, Staring other tests");
                    testRTC.start();
                    break;
                }
              case 'terminated':
              {
                console.log("Call Hungup");
                testRTC.start();
                stopStack();
                
                break;
              }

            case 'starting': default: break;
        }
    }

function testCall(){

   SIPml.init(
      function(e){
         sipStack =  new SIPml.Stack({

            realm: realm,
            impi:impi,
            impu: impu,
            password: password,
            display_name: display_name,
            enable_rtcweb_breaker: true,
            websocket_proxy_url: websocket_proxy_url,
            ice_servers: [{url: stun_url}],
          events_listener: { events: '*', listener: onSipEventStack },
          sip_headers: [
                    { name: 'User-Agent', value: 'IM-client/OMA1.0 sipML5-v1.2016.03.04' },
                    { name: 'Organization', value: 'Doubango Telecom' }
          ]
        });

        if(sipStack.start()){
          console.log("Stack started");
        }else{
          console.log("Failed to start");
        }
      });
}

if(testWebsocketSupport()){
  console.log("WebSoket is supportd by browser");
  
}else{
  console.log("WebSocket is not supportd");
}

testCall();
})
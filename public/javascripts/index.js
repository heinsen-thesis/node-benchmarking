$('#startTestBtn').click(function(event){
    console.log('Test');
    $.ajax({
    	type: 'POST',
    	url: '/startAvailabilityTest',
    	data: {
    		'host': $('#host').val(),
    		'nNodes': $('#nNodes').val(),
			'nRequests': $('#nRequests').val(),
			'startRate': $('#startRate').val(),
			'nSteps': $('#nSteps').val(),
			'startStep': $('#startStep').val()
    	}
    });
    event.preventDefault();
    
    $('#testInProgressDiv').html('The test is currently running');
});


$('#downloadTestFiles').click(function(event){
    console.log('DownloadTestFiles clicked');
    $.ajax({
        type: 'POST',
        url: '/zipTestFiles',
        data: {
        }}).done(function(){
            window.location.replace("./archive.zip");
        });
});
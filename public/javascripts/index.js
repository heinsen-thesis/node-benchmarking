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
});


$('#downloadTestFiles').click(function(event){
    console.log('DownloadTestFiles clicked');
    $.ajax({
        type: 'POST',
        url: '/zipTestFiles',
        data: {
        }}).done(function(){
            window.location.replace("/results/archive.zip");
        });
    event.preventDefault();
});
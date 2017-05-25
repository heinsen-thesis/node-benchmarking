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

$('#startScriptTestBtn').click(function(event){
    console.log('Test');
    $.ajax({
        type: 'POST',
        url: '/startScriptAvailabilityTest',
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
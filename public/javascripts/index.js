$('#startTestBtn').click(function(event){
    console.log('Test');
    $.post('/startAvailabilityTest');
    event.preventDefault();
});
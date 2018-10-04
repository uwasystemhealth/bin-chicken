$(document).ready(()=>{

    const copyToClipboard = (text) => {
        var $temp = $("<input>");
        $("body").append($temp);
        $temp.val(text).select();
        document.execCommand("copy");
        $temp.remove();
    };

    $('.copy-link').click(function(e){
        e.preventDefault();
        copyToClipboard($(this).attr('data-copy'));
        let copied = $('#copied-'+$(this).attr('data-index'));
        $(this).toggle();
        copied.toggle();
        setTimeout(()=> {
            $(this).toggle();
            copied.toggle();
        }, 5*1000);
    });

});
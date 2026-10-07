function switch_lang() {

    // Language Switcher 
    var langSwitcher = $('#lang-switcher');

    var currentURL = window.location.href;

    window.baseURL = currentURL.substr(0, currentURL.lastIndexOf('/') + 1);
    var slug = currentURL.substring(currentURL.lastIndexOf('/') + 1);

    // console.log($.trim(langSwitcher.text()));

    if($.trim(langSwitcher.text()) == 'English')
    {
        // arabic pages, switch to english

        // remove /ar/
        window.baseURL = window.baseURL.substr(0, window.baseURL.lastIndexOf('/ar/') + 1);

        // console.log(baseURL, slug);
        langSwitcher.attr('href', window.baseURL+slug);

    }
    else
    {
        // english pages, switch to arabic
        langSwitcher.attr('href', 'ar/'+slug);

    }
    // Language Switcher

}
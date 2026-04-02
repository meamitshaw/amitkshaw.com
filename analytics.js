(function() {
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  window.gtag = gtag;

  var gaScript = document.createElement('script');
  gaScript.async = true;
  gaScript.src = "https://www.googletagmanager.com/gtag/js?id=G-5BD4LY1CJZ";
  document.head.appendChild(gaScript);

  gtag('js', new Date());
  gtag('config', 'G-5BD4LY1CJZ', {
    anonymize_ip: true,
    page_path: window.location.pathname
  });
})();
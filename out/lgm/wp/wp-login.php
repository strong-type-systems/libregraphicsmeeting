<!DOCTYPE html>
<html lang="en-US">
 <head>
  <meta content="text/html; charset=utf-8" http-equiv="Content-Type"/>
  <title>
   Log In ‹ Libre Graphics Meeting — WordPress
  </title>
  <meta content="max-image-preview:large, noindex, noarchive" name="robots"/>
  <link href="/lgm/wp/wp-admin/load-styles.php_c=0_dir=ltr_load[chunk_0]=dashicons,buttons,forms,l10n,login_ver=6.5.4" media="all" rel="stylesheet" type="text/css"/>
  <style>
  </style>
  <style type="text/css">
   #wp_native_dashboard_language {padding: 2px;border-width: 1px;border-style: solid;height: 2em;vertical-align:top;margin-top: 2px;font-size:16px;width:100%; }
		#wp_native_dashboard_language option { padding-left: 4px; }
  </style>
  <meta content="strict-origin-when-cross-origin" name="referrer"/>
  <meta content="width=device-width" name="viewport"/>
 </head>
 <body class="login no-js login-action-login wp-core-ui locale-en-us">
  <script type="text/javascript">
   /* <![CDATA[ */
document.body.className = document.body.className.replace('no-js','js');
/* ]]> */
  </script>
  <div id="login">
   <h1>
    <a href="/lgm">
     Libre Graphics Meeting
    </a>
   </h1>
   <form action="/lgm/wp/wp-login.php" id="loginform" method="post" name="loginform">
    <p>
     <label for="user_login">
      Username or Email Address
     </label>
     <input autocapitalize="off" autocomplete="username" class="input" id="user_login" name="log" required="required" size="20" type="text" value=""/>
    </p>
    <div class="user-pass-wrap">
     <label for="user_pass">
      Password
     </label>
     <div class="wp-pwd">
      <input autocomplete="current-password" class="input password-input" id="user_pass" name="pwd" required="required" size="20" spellcheck="false" type="password" value=""/>
      <button aria-label="Show password" class="button button-secondary wp-hide-pw hide-if-no-js" data-toggle="0" type="button">
       <span aria-hidden="true" class="dashicons dashicons-visibility">
       </span>
      </button>
     </div>
    </div>
    <label>
     Language
    </label>
    <br/>
    <select id="wp_native_dashboard_language" name="wp_native_dashboard_language" tabindex="30">
     <option value="de_DE">
      Deutsch
     </option>
     <option selected="selected" value="en_US">
      English
     </option>
     <option value="es_ES">
      Español
     </option>
     <option value="fr_FR">
      Français
     </option>
     <option value="nl_NL">
      Nederlands
     </option>
    </select>
    <br/>
    <br/>
    <p class="forgetmenot">
     <input id="rememberme" name="rememberme" type="checkbox" value="forever"/>
     <label for="rememberme">
      Remember Me
     </label>
    </p>
    <p class="submit">
     <input class="button button-primary button-large" id="wp-submit" name="wp-submit" type="submit" value="Log In"/>
     <input name="redirect_to" type="hidden" value="https://libregraphicsmeeting.org/lgm/wp/wp-admin/"/>
     <input name="testcookie" type="hidden" value="1"/>
    </p>
   </form>
   <p id="nav">
    <a class="wp-login-lost-password" href="/lgm/wp/wp-login.php_action=lostpassword">
     Lost your password?
    </a>
   </p>
   <script type="text/javascript">
    /* <![CDATA[ */
function wp_attempt_focus() {setTimeout( function() {try {d = document.getElementById( "user_login" );d.focus(); d.select();} catch( er ) {}}, 200);}
wp_attempt_focus();
if ( typeof wpOnload === 'function' ) { wpOnload() }
/* ]]> */
   </script>
   <p id="backtoblog">
    <a href="/lgm/">
     ← Go to Libre Graphics Meeting
    </a>
   </p>
  </div>
  <div class="language-switcher">
   <form id="language-switcher" method="get">
    <label for="language-switcher-locales">
     <span aria-hidden="true" class="dashicons dashicons-translation">
     </span>
     <span class="screen-reader-text">
      Language
     </span>
    </label>
    <select id="language-switcher-locales" name="wp_lang">
     <option data-installed="1" lang="en" value="en_US">
      English (United States)
     </option>
     <option data-installed="1" lang="de" value="de_DE">
      Deutsch
     </option>
     <option data-installed="1" lang="es" value="es_ES">
      Español
     </option>
     <option data-installed="1" lang="fr" value="fr_FR">
      Français
     </option>
     <option data-installed="1" lang="nl" value="nl_NL">
      Nederlands
     </option>
    </select>
    <input class="button" type="submit" value="Change"/>
   </form>
  </div>
  <script type="text/javascript">
   /* <![CDATA[ */
var _zxcvbnSettings = {"src":"https:\/\/libregraphicsmeeting.org\/lgm\/wp\/wp-includes\/js\/zxcvbn.min.js"};/* ]]> */
  </script>
  <script src="/lgm/wp/wp-admin/load-scripts.php_c=0_load[chunk_0]=jquery-core,jquery-migrate,zxcvbn-async,wp-polyfill-inert,regenerator-runtime,wp-polyfill,wp-hooks_ver=6.5.4" type="text/javascript">
  </script>
  <script id="wp-i18n-js" src="/lgm/wp/wp-includes/js/dist/i18n.min.js_ver=5e580eb46a90c2b997e6.js" type="text/javascript">
  </script>
  <script id="wp-i18n-js-after" type="text/javascript">
   /* <![CDATA[ */
wp.i18n.setLocaleData( { 'text direction\u0004ltr': [ 'ltr' ] } );
/* ]]> */
  </script>
  <script id="password-strength-meter-js-extra" type="text/javascript">
   /* <![CDATA[ */
var pwsL10n = {"unknown":"Password strength unknown","short":"Very weak","bad":"Weak","good":"Medium","strong":"Strong","mismatch":"Mismatch"};
/* ]]> */
  </script>
  <script id="password-strength-meter-js" src="/lgm/wp/wp-admin/js/password-strength-meter.min.js_ver=6.5.4.js" type="text/javascript">
  </script>
  <script id="underscore-js" src="/lgm/wp/wp-includes/js/underscore.min.js_ver=1.13.4.js" type="text/javascript">
  </script>
  <script id="wp-util-js-extra" type="text/javascript">
   /* <![CDATA[ */
var _wpUtilSettings = {"ajax":{"url":"\/lgm\/wp\/wp-admin\/admin-ajax.php"}};
/* ]]> */
  </script>
  <script id="wp-util-js" src="/lgm/wp/wp-includes/js/wp-util.min.js_ver=6.5.4.js" type="text/javascript">
  </script>
  <script id="user-profile-js-extra" type="text/javascript">
   /* <![CDATA[ */
var userProfileL10n = {"user_id":"0","nonce":"0e58a75a81"};
/* ]]> */
  </script>
  <script id="user-profile-js" src="/lgm/wp/wp-admin/js/user-profile.min.js_ver=6.5.4.js" type="text/javascript">
  </script>
 </body>
</html>
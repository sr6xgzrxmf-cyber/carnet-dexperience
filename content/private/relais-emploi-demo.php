<?php
/**
 * Montage du WordPress de démonstration « Relais Emploi Lyon » dans WordPress Playground.
 * Exécuté une fois par le blueprint, après l'installation de GeneratePress, Fluent Forms et MailPoet.
 * Toutes les personnes, adresses et réponses sont fictives.
 */
require_once '/wordpress/wp-load.php';
require_once ABSPATH . 'wp-admin/includes/post.php';
require_once ABSPATH . 'wp-admin/includes/user.php';

global $wpdb;
$p = $wpdb->prefix;

/* ---------- Réglages généraux ---------- */
update_option('blogname', 'Relais Emploi Lyon');
update_option('blogdescription', 'Construisons ensemble votre retour à l’emploi');
update_option('timezone_string', 'Europe/Paris');
update_option('date_format', 'd/m/Y');
update_option('time_format', 'H:i');
update_option('permalink_structure', '/%postname%/');
update_option('default_comment_status', 'closed');

// Contenus par défaut de WordPress et de Fluent Forms.
foreach (get_posts(['post_type' => ['post', 'page'], 'post_status' => 'any', 'numberposts' => -1]) as $old) wp_delete_post($old->ID, true);
$wpdb->query("DELETE FROM {$p}fluentform_forms");
$wpdb->query("DELETE FROM {$p}fluentform_form_meta");

/* ---------- Thème : GeneratePress aux couleurs du site du Relais ---------- */
switch_theme('generatepress');
$gp = get_option('generate_settings', []);
$gp['global_colors'] = [
  ['name' => 'Contrast', 'slug' => 'contrast', 'color' => '#19283d'],
  ['name' => 'Contrast 2', 'slug' => 'contrast-2', 'color' => '#465263'],
  ['name' => 'Contrast 3', 'slug' => 'contrast-3', 'color' => '#b1d2e1'],
  ['name' => 'Base', 'slug' => 'base', 'color' => '#f0f0f0'],
  ['name' => 'Base 2', 'slug' => 'base-2', 'color' => '#f7f8f9'],
  ['name' => 'Base 3', 'slug' => 'base-3', 'color' => '#ffffff'],
  ['name' => 'Accent', 'slug' => 'accent', 'color' => '#ff4b34'],
  ['name' => 'Accent 2', 'slug' => 'accent-2', 'color' => '#89c63a'],
];
$gp['use_dynamic_typography'] = true;
$gp['font_manager'] = [['fontFamily' => 'Poppins', 'googleFont' => true, 'googleFontApi' => 1, 'googleFontCategory' => 'sans-serif', 'googleFontVariants' => '300, regular, 500, 600, 700']];
$gp['typography'] = [
  ['selector' => 'body', 'fontFamily' => 'Poppins', 'fontSize' => '16', 'lineHeight' => '1.7', 'module' => 'core', 'group' => 'base'],
  ['selector' => 'h1', 'fontWeight' => '600', 'fontSize' => '2.1', 'fontSizeUnit' => 'em', 'letterSpacing' => '-2', 'letterSpacingUnit' => 'px', 'module' => 'core', 'group' => 'content'],
  ['selector' => 'h2', 'fontWeight' => 'normal', 'textTransform' => 'uppercase', 'fontSize' => '28', 'letterSpacing' => '-1', 'letterSpacingUnit' => 'px', 'module' => 'core', 'group' => 'content'],
];
// Mise en page relevée sur relaisemploilyon.fr : logo à gauche, menu à droite, pas de colonne latérale.
$gp['container_width'] = '1200';
$gp['nav_position_setting'] = 'nav-float-right';
$gp['layout_setting'] = 'no-sidebar';
$gp['blog_layout_setting'] = 'no-sidebar';
$gp['single_layout_setting'] = 'no-sidebar';
$gp['hide_title'] = true;
$gp['hide_tagline'] = true;
$gp['logo_width'] = '170';
$gp['navigation_background_color'] = 'var(--base-3)';
$gp['navigation_text_color'] = 'var(--contrast)';
$gp['navigation_background_hover_color'] = 'var(--base-3)';
$gp['navigation_text_hover_color'] = 'var(--contrast-2)';
$gp['navigation_background_current_color'] = 'var(--base-3)';
$gp['navigation_text_current_color'] = 'var(--accent)';
$gp['subnavigation_background_color'] = 'var(--base)';
update_option('generate_settings', $gp);

require_once ABSPATH . 'wp-admin/includes/media.php';
require_once ABSPATH . 'wp-admin/includes/file.php';
require_once ABSPATH . 'wp-admin/includes/image.php';
$logo = media_sideload_image('https://www.relaisemploilyon.fr/wp-content/uploads/2022/01/cropped-relais-amical-relais-emploi-lyon-blue.png', 0, 'Relais Emploi Lyon – Relais Amical', 'id');
if (!is_wp_error($logo)) set_theme_mod('custom_logo', $logo);
else { $gp['hide_title'] = false; update_option('generate_settings', $gp); } // sans logo, le nom du site reste affiché

/* ---------- Bandeau « démonstration » sur tout le site ---------- */
@mkdir(WP_CONTENT_DIR . '/mu-plugins');
file_put_contents(WP_CONTENT_DIR . '/mu-plugins/relais-demo.php', <<<'PHP'
<?php
add_action('wp_body_open', function () {
  echo '<div style="background:#89c63a;color:#19283d;text-align:center;font:600 14px/1.4 Poppins,sans-serif;padding:8px 16px">Site de démonstration — données fictives — maquette proposée par Laurent Guyonnet (session 188)</div>';
});
// MailPoet signale qu'il tourne dans Playground : inutile pour la démonstration.
add_action('admin_head', function () { echo '<style>[data-notice="wordpress-playground-notice"]{display:none}</style>'; });
add_action('admin_notices', function () {
  echo '<div class="notice notice-info"><p><strong>Démonstration :</strong> les participants et les réponses sont fictifs. Vous pouvez tout essayer : rien n’est conservé à la fermeture de la page.</p></div>';
});
PHP);

/* ---------- Fluent Forms : constructeur de champs ---------- */
$defaults = include WP_PLUGIN_DIR . '/fluentform/app/Services/FormBuilder/DefaultElements.php';
$catalog = array_merge($defaults['general'], $defaults['advanced']);
$uid = 1000;

function relais_field($type, $name, $label, $extra = []) {
  global $catalog, $uid;
  $f = $catalog[$type];
  $f['uniqElKey'] = 'el_' . (++$uid);
  if (isset($f['attributes']['name'])) $f['attributes']['name'] = $name;
  $f['settings']['label'] = $label;
  $f['settings']['admin_field_label'] = $label;
  if (!empty($extra['required'])) {
    $f['settings']['validation_rules']['required']['value'] = true;
    $f['settings']['validation_rules']['required']['message'] = 'Ce champ est obligatoire';
  }
  if ($type === 'input_email') $f['attributes']['placeholder'] = 'prenom.nom@exemple.fr';
  if (isset($extra['placeholder'])) $f['attributes']['placeholder'] = $extra['placeholder'];
  if (isset($extra['help'])) $f['settings']['help_message'] = $extra['help'];
  if (isset($extra['type'])) $f['attributes']['type'] = $extra['type'];
  if (isset($extra['value'])) $f['attributes']['value'] = $extra['value'];
  if (isset($extra['rows'])) $f['attributes']['rows'] = $extra['rows'];
  if (isset($extra['options'])) {
    $f['settings']['advanced_options'] = array_map(fn($o) => ['label' => $o, 'value' => $o, 'calc_value' => '', 'image' => ''], $extra['options']);
  }
  if ($type === 'select') $f['settings']['placeholder'] = '— Choisir —';
  if ($type === 'gdpr_agreement') $f['settings']['tnc_html'] = $extra['text'];
  if ($type === 'section_break') $f['settings']['description'] = $extra['description'] ?? '';
  if ($type === 'custom_html') $f['settings']['html_codes'] = $extra['html'];
  if ($type === 'input_name') {
    $f['settings']['admin_field_label'] = 'Nom';
    $f['fields']['first_name']['settings']['label'] = 'Prénom';
    $f['fields']['first_name']['attributes']['placeholder'] = 'Prénom';
    $f['fields']['first_name']['settings']['validation_rules']['required'] = ['value' => true, 'message' => 'Indiquez votre prénom'];
    $f['fields']['last_name']['settings']['label'] = 'Nom';
    $f['fields']['last_name']['attributes']['placeholder'] = 'Nom';
    $f['fields']['last_name']['settings']['validation_rules']['required'] = ['value' => true, 'message' => 'Indiquez votre nom'];
    $f['fields']['middle_name']['settings']['visible'] = false;
  }
  return $f;
}

function relais_form($title, $fields, $button, $thanks) {
  global $wpdb, $p;
  foreach ($fields as $i => &$f) $f['index'] = $i;
  $submit = [
    'uniqElKey' => 'el_submit', 'element' => 'button', 'attributes' => ['type' => 'submit', 'class' => ''],
    'settings' => ['align' => 'left', 'button_style' => 'default', 'container_class' => '', 'help_message' => '',
      'background_color' => '#19283d', 'button_size' => 'md', 'color' => '#ffffff',
      'button_ui' => ['type' => 'default', 'text' => $button, 'img_url' => '']],
    'editor_options' => ['title' => 'Submit Button'],
  ];
  $now = current_time('mysql');
  $wpdb->insert("{$p}fluentform_forms", [
    'title' => $title, 'status' => 'published', 'form_fields' => wp_json_encode(['fields' => $fields, 'submitButton' => $submit]),
    'has_payment' => 0, 'type' => 'form', 'created_by' => 1, 'created_at' => $now, 'updated_at' => $now,
  ]);
  $id = (int) $wpdb->insert_id;
  $settings = [
    'confirmation' => ['redirectTo' => 'samePage', 'messageToShow' => $thanks, 'customPage' => null, 'samePageFormBehavior' => 'hide_form', 'customUrl' => null],
    'restrictions' => ['limitNumberOfEntries' => ['enabled' => false], 'scheduleForm' => ['enabled' => false], 'requireLogin' => ['enabled' => false], 'denyEmptySubmission' => ['enabled' => false]],
    'layout' => ['labelPlacement' => 'top', 'helpMessagePlacement' => 'with_label', 'errorMessagePlacement' => 'inline', 'asteriskPlacement' => 'asterisk-right'],
  ];
  $wpdb->insert("{$p}fluentform_form_meta", ['form_id' => $id, 'meta_key' => 'formSettings', 'value' => wp_json_encode($settings)]);
  // Alerte par mail au bénévole à chaque fiche reçue.
  $notification = ['name' => 'Alerte bénévole', 'sendTo' => ['type' => 'email', 'email' => '{wp.admin_email}', 'field' => '', 'routing' => []],
    'fromName' => 'Relais Emploi Lyon', 'fromEmail' => '', 'replyTo' => '', 'bcc' => '', 'subject' => 'Nouvelle réponse : ' . $title,
    'message' => '<p>{all_data}</p>', 'conditionals' => ['status' => false, 'type' => 'all', 'conditions' => []], 'enabled' => true, 'email_template' => ''];
  $wpdb->insert("{$p}fluentform_form_meta", ['form_id' => $id, 'meta_key' => 'notifications', 'value' => wp_json_encode($notification)]);
  return $id;
}

function relais_entry($formId, $data, $date, $status = 'read') {
  global $wpdb, $p;
  static $serials = [];
  $serials[$formId] = ($serials[$formId] ?? 0) + 1;
  $wpdb->insert("{$p}fluentform_submissions", [
    'form_id' => $formId, 'serial_number' => $serials[$formId], 'response' => wp_json_encode($data), 'source_url' => home_url('/'),
    'user_id' => 0, 'status' => $status, 'is_favourite' => 0, 'browser' => 'Chrome', 'device' => 'Desktop', 'ip' => '',
    'created_at' => $date, 'updated_at' => $date,
  ]);
  $entryId = (int) $wpdb->insert_id;
  foreach ($data as $key => $value) {
    foreach (is_array($value) ? $value : ['' => $value] as $sub => $v) {
      if ($v === '' || $v === null) continue;
      $wpdb->insert("{$p}fluentform_entry_details", ['form_id' => $formId, 'submission_id' => $entryId, 'field_name' => $key, 'sub_field_name' => (string) $sub, 'field_value' => maybe_serialize($v)]);
    }
  }
}

$consentAccompagnement = 'J’accepte que le Relais Emploi Lyon utilise ces informations pour mon accompagnement. Elles sont conservées trois ans après mon dernier contact, puis supprimées.';
$optReseau = 'J’accepte de figurer dans la liste réseau du Relais, réservée aux participants et aux bénévoles';
$optNewsletter = 'Je souhaite recevoir la newsletter du Relais';
$optPublication = 'J’accepte que mon pitch soit publié dans la newsletter du Relais';
$optNouvelles = 'J’accepte que ces nouvelles paraissent dans la newsletter';

/* ---------- Formulaire 1 : inscription à la session ---------- */
$formInscription = relais_form('Inscription à la session', [
  relais_field('section_break', 'coordonnees', 'Vos coordonnées', ['description' => 'Ces informations restent réservées aux bénévoles du Relais.']),
  relais_field('input_name', 'names', 'Nom'),
  relais_field('input_email', 'email', 'Adresse e-mail', ['required' => true]),
  relais_field('input_text', 'telephone', 'Téléphone', ['type' => 'tel', 'required' => true, 'placeholder' => '06 12 34 56 78']),
  relais_field('input_url', 'linkedin', 'Profil LinkedIn', ['placeholder' => 'https://www.linkedin.com/in/…']),
  relais_field('input_text', 'session', 'Session', ['value' => '189', 'help' => 'Pré-rempli par le Relais.']),
  relais_field('input_text', 'ancien_poste', 'Dernier poste occupé', ['placeholder' => 'Intitulé et entreprise']),
  relais_field('input_text', 'poste_recherche', 'Poste recherché'),
  relais_field('section_break', 'exercice', 'Premier exercice : « L’art de se présenter »', ['description' => 'Quelques phrases pour chacun des trois temps. C’est un premier jet : vous le retravaillerez pendant la session.']),
  relais_field('textarea', 'qui_je_suis', 'Qui je suis', ['rows' => 3]),
  relais_field('textarea', 'd_ou_je_viens', 'D’où je viens', ['rows' => 3]),
  relais_field('textarea', 'ou_je_vais', 'Où je vais', ['rows' => 3]),
  relais_field('section_break', 'choix', 'Vos choix', ['description' => 'Les deux dernières cases sont facultatives.']),
  relais_field('gdpr_agreement', 'consentement', 'Accompagnement', ['text' => $consentAccompagnement]),
  relais_field('input_checkbox', 'liste_reseau', 'Liste réseau', ['options' => [$optReseau]]),
  relais_field('input_checkbox', 'newsletter', 'Newsletter', ['options' => [$optNewsletter]]),
], 'Envoyer ma fiche', 'Merci, votre fiche est bien enregistrée. À très vite pour la première séance !');

/* ---------- Formulaire 2 : pitch final ---------- */
$formPitch = relais_form('Pitch final', [
  relais_field('input_name', 'names', 'Nom'),
  relais_field('input_email', 'email', 'Adresse e-mail', ['required' => true, 'help' => 'La même que pour votre inscription : votre pitch rejoint ainsi votre fiche.']),
  relais_field('input_text', 'session', 'Session', ['value' => '189']),
  relais_field('textarea', 'pitch', 'Mon pitch final', ['rows' => 6, 'required' => true, 'help' => 'La version travaillée pendant la session, en une minute de lecture.']),
  relais_field('input_checkbox', 'publication', 'Publication', ['options' => [$optPublication]]),
], 'Envoyer mon pitch', 'Merci ! Votre pitch final est enregistré. Bravo pour ces quatre semaines.');

/* ---------- Formulaire 3 : nouvelles des anciens ---------- */
$formNouvelles = relais_form('Donnez-nous de vos nouvelles', [
  relais_field('input_name', 'names', 'Nom'),
  relais_field('input_email', 'email', 'Adresse e-mail', ['required' => true, 'help' => 'Celle que vous aviez donnée au Relais, si possible.']),
  relais_field('input_text', 'session', 'Votre session', ['placeholder' => 'Par exemple 185']),
  relais_field('select', 'situation', 'Votre situation', ['required' => true, 'options' => ['En poste (CDI)', 'En poste (CDD, intérim, mission)', 'En formation', 'Création ou reprise d’entreprise', 'Toujours en recherche']]),
  relais_field('input_text', 'poste_employeur', 'Poste et employeur', ['placeholder' => 'Par exemple : Responsable formation chez…']),
  relais_field('input_url', 'linkedin', 'Profil LinkedIn'),
  relais_field('textarea', 'message', 'Un mot pour le réseau', ['rows' => 4, 'help' => 'Un conseil, une rencontre qui vous a aidé, une offre à partager…']),
  relais_field('input_checkbox', 'publication', 'Publication', ['options' => [$optNouvelles]]),
], 'Envoyer mes nouvelles', 'Merci pour vos nouvelles ! Elles mettent à jour la liste réseau et paraîtront peut-être dans le prochain numéro.');

/* ---------- Participants et réponses fictifs ---------- */
$people = [
  // prénom, nom, session, ancien poste, poste recherché, réseau, newsletter, date d'inscription
  ['Claire', 'Morel', '187', 'Responsable administrative et financière, PME industrielle', 'Responsable administrative et financière', true, true, '2026-05-18 09:12:00'],
  ['Karim', 'Haddad', '187', 'Chef de projet informatique, assurance', 'Chef de projet transformation', true, true, '2026-05-19 18:40:00'],
  ['Hélène', 'Vasseur', '187', 'Acheteuse, distribution', 'Acheteuse ou approvisionneuse', true, false, '2026-05-20 11:03:00'],
  ['Thomas', 'Girard', '187', 'Responsable logistique, transport', 'Responsable d’entrepôt', false, true, '2026-05-21 08:27:00'],
  ['Nadia', 'Benkacem', '187', 'Chargée de communication, collectivité', 'Chargée de communication', true, true, '2026-05-22 14:55:00'],
  ['Pierre', 'Lefèvre', '187', 'Ingénieur qualité, agroalimentaire', 'Responsable qualité', true, true, '2026-05-25 10:16:00'],
  ['Amélie', 'Roussel', '189', 'Responsable des ressources humaines, ESN', 'Responsable RH', true, true, '2026-10-26 09:48:00'],
  ['Julien', 'Marchand', '189', 'Contrôleur de gestion, BTP', 'Contrôleur de gestion', true, false, '2026-10-27 17:21:00'],
  ['Sabrina', 'Collet', '189', 'Responsable formation, santé', 'Responsable formation', true, true, '2026-10-28 08:05:00'],
];
$pitchs = [
  'Claire'  => 'Je suis responsable administrative et financière. Pendant douze ans, j’ai tenu les comptes et la paie d’une PME de 80 salariés, et j’ai mené le passage à la facture électronique. Je cherche un poste de RAF dans une entreprise de taille moyenne, où la rigueur sert aussi à faire grandir l’équipe.',
  'Karim'   => 'Je suis chef de projet informatique. J’ai conduit le changement d’outil de gestion des contrats pour 300 utilisateurs, de la recette à la formation. Je cherche un poste de chef de projet transformation, là où la technique doit être adoptée par les équipes.',
  'Nadia'   => 'Je suis chargée de communication. J’ai animé pendant huit ans le site et les réseaux d’une collectivité, et lancé une lettre aux habitants lue par 12 000 abonnés. Je cherche à rejoindre une association ou une entreprise engagée, pour raconter ce qu’elle fait de bien.',
  'Pierre'  => 'Je suis ingénieur qualité. J’ai préparé et réussi trois audits IFS dans l’agroalimentaire, avec des équipes de production en trois-huit. Je cherche un poste de responsable qualité dans la région lyonnaise.',
];
foreach ($people as $i => [$first, $last, $session, $was, $wants, $reseau, $news, $date]) {
  $email = strtolower(remove_accents($first . '.' . $last)) . '@example.org';
  relais_entry($formInscription, [
    'names' => ['first_name' => $first, 'last_name' => $last],
    'email' => $email,
    'telephone' => sprintf('06 00 00 %02d %02d', 10 + $i, 20 + $i),
    'linkedin' => 'https://www.linkedin.com/in/exemple-' . sanitize_title($first . '-' . $last),
    'session' => $session,
    'ancien_poste' => $was,
    'poste_recherche' => $wants,
    'qui_je_suis' => 'Je m’appelle ' . $first . ', j’aime organiser et transmettre.',
    'd_ou_je_viens' => 'Dernier poste : ' . $was . '.',
    'ou_je_vais' => 'Objectif : ' . $wants . ', dans la région lyonnaise.',
    'consentement' => 'on',
    'liste_reseau' => $reseau ? [$optReseau] : [],
    'newsletter' => $news ? [$optNewsletter] : [],
  ], $date, $session === '189' && $i === count($people) - 1 ? 'unread' : 'read');
  if (isset($pitchs[$first])) {
    relais_entry($formPitch, [
      'names' => ['first_name' => $first, 'last_name' => $last], 'email' => $email, 'session' => $session,
      'pitch' => $pitchs[$first], 'publication' => [$optPublication],
    ], '2026-06-19 16:' . (10 + $i) . ':00');
  }
}
$nouvelles = [
  ['Sophie', 'Delmas', '184', 'En poste (CDI)', 'Responsable paie chez un groupe de distribution', 'Le réseau a tout changé : c’est une ancienne de ma session qui m’a présentée à mon manager actuel. Je suis disponible pour des entretiens réseau sur les métiers de la paie.', '2026-10-06 19:02:00'],
  ['Marc', 'Aubert', '186', 'Création ou reprise d’entreprise', 'Consultant indépendant en achats', 'J’ai créé mon activité en septembre. Je cherche des retours d’anciens qui ont fait le même choix.', '2026-10-14 12:30:00'],
  ['Laure', 'Perrin', '187', 'En poste (CDD, intérim, mission)', 'Chargée de mission RSE, mission de six mois', 'Une mission qui me permet de me reconvertir dans la RSE. Merci aux bénévoles pour la préparation aux entretiens !', '2026-10-23 08:44:00'],
];
foreach ($nouvelles as [$first, $last, $session, $situation, $job, $message, $date]) {
  relais_entry($formNouvelles, [
    'names' => ['first_name' => $first, 'last_name' => $last],
    'email' => strtolower(remove_accents($first . '.' . $last)) . '@example.org',
    'session' => $session, 'situation' => $situation, 'poste_employeur' => $job, 'message' => $message, 'publication' => [$optNouvelles],
  ], $date, 'unread');
}

/* ---------- Pages ---------- */
function relais_page($title, $content, $args = []) {
  return wp_insert_post(array_merge(['post_type' => 'page', 'post_status' => 'publish', 'post_title' => $title, 'post_content' => $content], $args));
}
$urlInscription = home_url('/inscription-session-189/');
$urlPitch = home_url('/pitch-final-session-189/');
$urlNouvelles = home_url('/reseau/donnez-nous-de-vos-nouvelles/');
$urlNewsletter = home_url('/reseau/recevoir-la-newsletter/');
$home = relais_page('Accueil', <<<HTML
<!-- wp:heading {"textAlign":"center","level":1,"textColor":"accent"} --><h1 class="wp-block-heading has-text-align-center has-accent-color has-text-color">Relais Emploi Lyon | Le réseau des participants</h1><!-- /wp:heading -->
<!-- wp:paragraph --><p>Cette maquette reprend le site du Relais pour montrer, sur un vrai WordPress, comment faire vivre le réseau des participants : inscription en ligne, pitch final, nouvelles des anciens et newsletter.</p><!-- /wp:paragraph -->
<!-- wp:heading --><h2 class="wp-block-heading">Le parcours en quatre pages</h2><!-- /wp:heading -->
<!-- wp:list --><ul><!-- wp:list-item --><li><a href="{$urlInscription}">Inscription à la session 189</a> (page protégée, mot de passe : Relais189)</li><!-- /wp:list-item --><!-- wp:list-item --><li><a href="{$urlPitch}">Pitch final</a> (même mot de passe)</li><!-- /wp:list-item --><!-- wp:list-item --><li><a href="{$urlNouvelles}">Donnez-nous de vos nouvelles</a></li><!-- /wp:list-item --><!-- wp:list-item --><li><a href="{$urlNewsletter}">Recevoir la newsletter</a></li><!-- /wp:list-item --></ul><!-- /wp:list -->
HTML);
update_post_meta($home, '_generate-disable-headline', 'true');
$demandeurs = relais_page('Demandeurs d’emploi', '<!-- wp:paragraph --><p>Page du site actuel, non reproduite dans la maquette.</p><!-- /wp:paragraph -->');
$reseau = relais_page('Réseau', '<!-- wp:paragraph --><p>Bénévoles, partenaires et anciens participants : le réseau du Relais.</p><!-- /wp:paragraph -->');
$nouvellesPage = relais_page('Donnez-nous de vos nouvelles', <<<HTML
<!-- wp:paragraph --><p>Vous avez suivi une session du Relais ? Racontez-nous où vous en êtes. Vos nouvelles mettent à jour la liste réseau et, si vous l’acceptez, paraissent dans la newsletter.</p><!-- /wp:paragraph -->
<!-- wp:shortcode -->[fluentform id="{$formNouvelles}"]<!-- /wp:shortcode -->
HTML, ['post_parent' => $reseau, 'post_name' => 'donnez-nous-de-vos-nouvelles']);
$contact = relais_page('Contact', '<!-- wp:paragraph --><p>81, rue de la République, 69002 Lyon — Métro Bellecour, lignes A et D.</p><!-- /wp:paragraph -->');
$inscription = relais_page('Inscription à la session 189', <<<HTML
<!-- wp:paragraph --><p>Bienvenue dans la session 189 ! Merci de remplir votre fiche avant la première séance du lundi 2 novembre. Elle nous aide à préparer le groupe, et votre premier jet de présentation servira de point de départ à l’atelier Accueil.</p><!-- /wp:paragraph -->
<!-- wp:paragraph --><p><strong>Votre agenda :</strong> les 21 demi-journées de la session sont dans l’agenda partagé du Relais. Un clic sur le lien d’abonnement du mail de bienvenue les ajoute à votre propre agenda, et les changements s’y reportent tout seuls.</p><!-- /wp:paragraph -->
<!-- wp:shortcode -->[fluentform id="{$formInscription}"]<!-- /wp:shortcode -->
HTML, ['post_password' => 'Relais189', 'post_name' => 'inscription-session-189']);
$pitchPage = relais_page('Pitch final — session 189', <<<HTML
<!-- wp:paragraph --><p>Dernière séance : déposez ici la version aboutie de votre pitch. Seule cette version peut être publiée dans la newsletter, et seulement si vous cochez la case.</p><!-- /wp:paragraph -->
<!-- wp:shortcode -->[fluentform id="{$formPitch}"]<!-- /wp:shortcode -->
HTML, ['post_password' => 'Relais189', 'post_name' => 'pitch-final-session-189']);
$actualites = relais_page('Actualités', '');
update_option('show_on_front', 'page');
update_option('page_on_front', $home);
update_option('page_for_posts', $actualites);

/* ---------- Articles : un bénévole « Contributeur » ---------- */
$benevole = wp_insert_user(['user_login' => 'benevole.demo', 'user_pass' => wp_generate_password(24), 'user_email' => 'benevole.demo@example.org',
  'display_name' => 'Michel (bénévole)', 'first_name' => 'Michel', 'role' => 'contributor']);
wp_insert_post(['post_type' => 'post', 'post_status' => 'publish', 'post_author' => 1, 'post_date' => '2026-10-12 09:00:00',
  'post_title' => 'Session 188 : quatre semaines en images',
  'post_content' => '<!-- wp:paragraph --><p>Article d’exemple publié par un responsable du site.</p><!-- /wp:paragraph -->']);
wp_insert_post(['post_type' => 'post', 'post_status' => 'pending', 'post_author' => $benevole,
  'post_title' => 'Préparer un entretien réseau en cinq questions',
  'post_content' => '<!-- wp:paragraph --><p>Un entretien réseau n’est pas un entretien d’embauche. Vous venez chercher un regard, pas un poste. Voici les cinq questions que je conseille de préparer…</p><!-- /wp:paragraph -->']);

/* ---------- Menu principal ---------- */
$menuId = wp_create_nav_menu('Menu principal');
foreach ([$home, $demandeurs, $reseau, $actualites, $contact] as $pos => $pageId) {
  wp_update_nav_menu_item($menuId, 0, ['menu-item-object-id' => $pageId, 'menu-item-object' => 'page', 'menu-item-type' => 'post_type', 'menu-item-status' => 'publish', 'menu-item-position' => $pos + 1]);
}
set_theme_mod('nav_menu_locations', ['primary' => $menuId]);

/* ---------- MailPoet : liste, abonnés, formulaire et numéro 0 ---------- */
$settings = \MailPoet\Settings\SettingsController::getInstance();
$settings->set('version', MAILPOET_VERSION); // passe l'assistant de démarrage
$settings->set('sender', ['name' => 'Relais Emploi Lyon', 'address' => 'relais.emploi.lyon@orange.fr']);
$settings->set('reply_to', ['name' => 'Relais Emploi Lyon', 'address' => 'relais.emploi.lyon@orange.fr']);
$settings->set('signup_confirmation.enabled', '1');

// Pas de tutoriel en anglais ni d'alerte sur la tâche planifiée, propre à Playground.
foreach (['editor_tutorial_seen', 'form_editor_tutorial_seen'] as $flag) {
  $wpdb->insert("{$p}mailpoet_user_flags", ['user_id' => 1, 'name' => $flag, 'value' => '1', 'created_at' => current_time('mysql'), 'updated_at' => current_time('mysql')]);
}
set_transient('dismissed-wp-cron-disabled-notice', true, YEAR_IN_SECONDS);

$mp = \MailPoet\API\API::MP('v1');
$list = $mp->addList(['name' => 'Réseau du Relais', 'description' => 'Participants et anciens participants qui ont choisi de recevoir la newsletter.']);
$abonnes = array_merge(
  array_map(fn($x) => [$x[0], $x[1]], array_filter($people, fn($x) => $x[6])),
  array_map(fn($x) => [$x[0], $x[1]], $nouvelles)
);
foreach ($abonnes as [$first, $last]) {
  $mp->addSubscriber(['email' => strtolower(remove_accents($first . '.' . $last)) . '@example.org', 'first_name' => $first, 'last_name' => $last],
    [$list['id']], ['send_confirmation_email' => false, 'schedule_welcome_email' => false, 'skip_subscriber_notification' => true]);
}
$wpdb->query("UPDATE {$p}mailpoet_subscribers SET status = 'subscribed'");
$wpdb->query("UPDATE {$p}mailpoet_subscriber_segment SET status = 'subscribed'");

// Formulaire d'abonnement, pour les anciens qui choisissent de recevoir la newsletter.
$form = new \MailPoet\Entities\FormEntity('Recevoir la newsletter du Relais');
$form->setBody([
  ['type' => 'text', 'name' => 'Prénom', 'id' => 'first_name', 'unique' => '1', 'static' => '0', 'params' => ['label' => 'Prénom']],
  ['type' => 'text', 'name' => 'Email', 'id' => 'email', 'unique' => '0', 'static' => '1', 'params' => ['label' => 'Adresse e-mail', 'required' => '1']],
  ['type' => 'submit', 'name' => 'Submit', 'id' => 'submit', 'unique' => '0', 'static' => '1', 'params' => ['label' => 'Je m’abonne']],
]);
$form->setSettings(['segments' => [(string) $list['id']], 'segments_selected_by' => 'admin', 'on_success' => 'message',
  'success_message' => 'C’est noté ! Confirmez votre abonnement grâce au mail que vous allez recevoir.', 'form_placement' => []]);
$form->setStatus('enabled');
$em = \MailPoet\DI\ContainerWrapper::getInstance()->get(\MailPoetVendor\Doctrine\ORM\EntityManager::class);
$em->persist($form);
$em->flush();
relais_page('Recevoir la newsletter', <<<HTML
<!-- wp:paragraph --><p>Une lettre tous les deux mois : la nouvelle session se présente, des nouvelles des anciens, un article d’un bénévole. Désinscription en un clic.</p><!-- /wp:paragraph -->
<!-- wp:shortcode -->[mailpoet_form id="{$form->getId()}"]<!-- /wp:shortcode -->
HTML, ['post_parent' => $reseau, 'post_name' => 'recevoir-la-newsletter']);

// Le numéro 0, aux couleurs du site.
function relais_text($html) { return ['type' => 'text', 'text' => $html]; }
function relais_spacer($h) { return ['type' => 'spacer', 'styles' => ['block' => ['backgroundColor' => 'transparent', 'height' => $h]]]; }
function relais_divider() { return ['type' => 'divider', 'styles' => ['block' => ['backgroundColor' => 'transparent', 'padding' => '13px', 'borderStyle' => 'solid', 'borderWidth' => '1px', 'borderColor' => '#b1d2e1']]]; }
function relais_button($text, $url, $bg) {
  return ['type' => 'button', 'text' => $text, 'url' => $url, 'styles' => ['block' => ['backgroundColor' => $bg, 'borderColor' => $bg, 'borderWidth' => '0px',
    'borderRadius' => '4px', 'borderStyle' => 'solid', 'width' => '260px', 'lineHeight' => '44px', 'fontColor' => '#ffffff', 'fontFamily' => 'Arial', 'fontSize' => '15px', 'fontWeight' => 'bold', 'textAlign' => 'center']]];
}
function relais_row($blocks, $bg = '#ffffff') {
  return ['type' => 'container', 'orientation' => 'horizontal', 'styles' => ['block' => ['backgroundColor' => $bg]],
    'blocks' => [['type' => 'container', 'orientation' => 'vertical', 'styles' => ['block' => ['backgroundColor' => 'transparent']], 'blocks' => $blocks]]];
}
$pitchBlocks = '';
foreach (['Claire' => 'Morel', 'Karim' => 'Haddad', 'Nadia' => 'Benkacem'] as $first => $last) {
  $pitchBlocks .= '<p><strong>' . $first . ' ' . $last . '</strong><br />' . esc_html($pitchs[$first]) . '</p>';
}
$newsBlocks = '';
foreach ($nouvelles as [$first, $last, $session, $situation, $job, $message]) {
  $newsBlocks .= '<p><strong>' . $first . ' ' . $last . '</strong> (session ' . $session . ') — ' . esc_html($job) . '<br /><em>« ' . esc_html($message) . ' »</em></p>';
}
$body = [
  'content' => ['type' => 'container', 'orientation' => 'vertical', 'styles' => ['block' => ['backgroundColor' => 'transparent']], 'blocks' => [
    relais_row(is_wp_error($logo) ? [relais_spacer('10px')] : [relais_spacer('16px'), ['type' => 'image', 'link' => home_url('/'), 'src' => wp_get_attachment_url($logo), 'alt' => 'Relais Emploi Lyon – Relais Amical',
      'fullWidth' => false, 'width' => '170px', 'height' => '46px', 'styles' => ['block' => ['textAlign' => 'center']]], relais_spacer('10px')]),
    relais_row([relais_spacer('20px'), relais_text('<h1 style="text-align: left;"><span style="color: #ffffff;">La lettre du réseau</span></h1><p style="text-align: left;"><span style="color: #b1d2e1;">Numéro 0 — novembre 2026</span></p>'), relais_spacer('10px')], '#19283d'),
    relais_row([relais_spacer('20px'), relais_text('<p>Bonjour [subscriber:firstname | default:à toutes et à tous],</p><p>Voici le premier numéro de la lettre du réseau du Relais. Tous les deux mois, elle vous présente la nouvelle session, donne des nouvelles des anciens et partage le conseil d’un bénévole.</p>')]),
    relais_row([relais_divider(), relais_text('<h2>La session 187 se présente</h2><p>Leurs pitchs finaux, publiés avec leur accord.</p>' . $pitchBlocks)]),
    relais_row([relais_divider(), relais_text('<h2>Des nouvelles des anciens</h2>' . $newsBlocks)]),
    relais_row([relais_divider(), relais_text('<h2>Le conseil d’un bénévole</h2><p><strong>Préparer un entretien réseau en cinq questions</strong>, par Michel. Un entretien réseau n’est pas un entretien d’embauche : vous venez chercher un regard, pas un poste.</p>'), relais_button('Lire l’article', home_url('/actualites/'), '#19283d')]),
    relais_row([relais_divider(), relais_text('<h2>Et vous, où en êtes-vous ?</h2><p>Un nouveau poste, une formation, une création d’entreprise ? Deux minutes suffisent, et le réseau en profite.</p>'), relais_button('Donnez-nous de vos nouvelles', home_url('/reseau/donnez-nous-de-vos-nouvelles/'), '#ff4b34'), relais_spacer('20px')]),
    relais_row([['type' => 'footer', 'text' => '<p><a href="[link:subscription_unsubscribe_url]">Se désinscrire</a> | <a href="[link:subscription_manage_url]">Gérer mon abonnement</a><br />Relais Emploi Lyon — 81, rue de la République, 69002 Lyon</p>',
      'styles' => ['block' => ['backgroundColor' => 'transparent'], 'text' => ['fontColor' => '#465263', 'fontFamily' => 'Arial', 'fontSize' => '12px', 'textAlign' => 'center'], 'link' => ['fontColor' => '#19283d', 'textDecoration' => 'underline']]]], '#f7f8f9'),
  ]],
  'globalStyles' => [
    'text' => ['fontColor' => '#19283d', 'fontFamily' => 'Arial', 'fontSize' => '15px', 'lineHeight' => '1.6'],
    'h1' => ['fontColor' => '#ffffff', 'fontFamily' => 'Arial', 'fontSize' => '28px', 'lineHeight' => '1.3'],
    'h2' => ['fontColor' => '#19283d', 'fontFamily' => 'Arial', 'fontSize' => '22px', 'lineHeight' => '1.4'],
    'h3' => ['fontColor' => '#465263', 'fontFamily' => 'Arial', 'fontSize' => '18px', 'lineHeight' => '1.4'],
    'link' => ['fontColor' => '#ff4b34', 'textDecoration' => 'underline'],
    'wrapper' => ['backgroundColor' => '#ffffff'],
    'body' => ['backgroundColor' => '#f0f0f0'],
  ],
];
$newsletter = new \MailPoet\Entities\NewsletterEntity();
$newsletter->setType('standard');
$newsletter->setSubject('La lettre du réseau du Relais — n° 0');
$newsletter->setPreheader('La session 187 se présente, des nouvelles des anciens et le conseil d’un bénévole.');
$newsletter->setBody($body);
$newsletter->setStatus('draft');
$newsletter->setSenderName('Relais Emploi Lyon');
$newsletter->setSenderAddress('relais.emploi.lyon@orange.fr');
$em->persist($newsletter);
$segment = $em->getReference(\MailPoet\Entities\SegmentEntity::class, (int) $list['id']);
$em->persist(new \MailPoet\Entities\NewsletterSegmentEntity($newsletter, $segment));
$em->flush();

flush_rewrite_rules();
echo 'Relais : formulaires ' . implode(', ', [$formInscription, $formPitch, $formNouvelles]) . ' ; newsletter ' . $newsletter->getId();

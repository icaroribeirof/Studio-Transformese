<?php
// api/debug_upload.php
// USE APENAS PARA DIAGNOSTICAR - APAGUE APÓS O USO
if (session_status() === PHP_SESSION_NONE) session_start();
include_once '../db_connect.php';
include_once 'api_auth_check.php';

header('Content-Type: application/json');
api_require_auth('admin');

define('PROJECT_ROOT', realpath(__DIR__ . '/..'));

$info = [
    'php_version'        => PHP_VERSION,
    'project_root'       => PROJECT_ROOT,
    'upload_dir'         => PROJECT_ROOT . '/uploads/produtos/',
    'upload_dir_exists'  => is_dir(PROJECT_ROOT . '/uploads/produtos/'),
    'upload_dir_writable'=> is_writable(PROJECT_ROOT . '/uploads/'),
    'upload_max_filesize'=> ini_get('upload_max_filesize'),
    'post_max_size'      => ini_get('post_max_size'),
    'file_uploads'       => ini_get('file_uploads'),
    'files_received'     => $_FILES,
    'post_received'      => $_POST,
    'request_method'     => $_SERVER['REQUEST_METHOD'],
    'content_type'       => $_SERVER['CONTENT_TYPE'] ?? 'não definido',
];

// Tenta criar a pasta se não existir
if (!$info['upload_dir_exists']) {
    $created = mkdir(PROJECT_ROOT . '/uploads/produtos/', 0755, true);
    $info['upload_dir_created'] = $created;
    $info['upload_dir_exists']  = is_dir(PROJECT_ROOT . '/uploads/produtos/');
}

echo json_encode($info, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
?>

<?php
// Прокси отправки заявок в Telegram.
// Впишите токен бота и chat_id ниже после выгрузки на Beget.

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  echo json_encode(['ok' => false, 'error' => 'Method not allowed']); exit;
}

$BOT_TOKEN = 'PASTE_TOKEN_HERE';
$CHAT_ID   = 'PASTE_CHAT_ID_HERE';

$d = json_decode(file_get_contents('php://input'), true) ?: [];

if (empty($d['phone'])) {
  http_response_code(400);
  echo json_encode(['ok' => false, 'error' => 'Phone required']); exit;
}

$text  = "🔥 Заявка с sanitarnyeresheniya.ru\n\n";
$text .= "📞 Телефон: " . $d['phone'] . "\n";
if (!empty($d['name']))       $text .= "👤 Имя: " . $d['name'] . "\n";
if (!empty($d['city']))       $text .= "🏙 Город: " . $d['city'] . "\n";
if (!empty($d['objectType'])) $text .= "🏠 Объект: " . $d['objectType'] . "\n";
if (!empty($d['problem']))    $text .= "⚠️ Проблема: " . $d['problem'] . "\n";
if (!empty($d['service']))    $text .= "🧪 Услуга: " . $d['service'] . "\n";
if (!empty($d['urgency']))    $text .= "⏱ Срочность: " . $d['urgency'] . "\n";
if (!empty($d['comment']))    $text .= "💬 Коммент: " . $d['comment'] . "\n";
if (!empty($d['formName']))   $text .= "📋 Форма: " . $d['formName'] . "\n";
$text .= "\n🌐 " . ($d['page'] ?? $_SERVER['HTTP_REFERER'] ?? '') . "\n";
$text .= "🕒 " . date('d.m.Y H:i:s');

$ch = curl_init("https://api.telegram.org/bot{$BOT_TOKEN}/sendMessage");
curl_setopt_array($ch, [
  CURLOPT_POST => true,
  CURLOPT_POSTFIELDS => json_encode(['chat_id' => $CHAT_ID, 'text' => $text], JSON_UNESCAPED_UNICODE),
  CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_TIMEOUT => 10,
]);
$resp = curl_exec($ch);
curl_close($ch);

echo $resp ?: json_encode(['ok' => false]);

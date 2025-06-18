import 'package:flutter/material.dart';

class AppSettings{

  static const AppName = 'وظفني';
  static bool debug = false;
  static String appFont = 'Cairo';
  // static String BASE_URL = 'http://147.93.46.66:8080';
  // static String BASE_URL = 'http://4.157.252.54:8080';
  static String BASE_URL = 'https://api.wazzifni.net';

}

const Map<String, Locale> LANGUAGES = {
  'ar': Locale('ar'),
  'en': Locale('en'),
  // 'fa': Locale('fa'),
  // 'ku': Locale('ku'),
};

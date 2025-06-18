import 'package:flutter/material.dart';

class AppColors {

  static const Color scaffoldBackground = Color(0xFFfbfcfd);
  static const Color primaryColor = Color(0xFF004e92);
  static const Color darkPrimaryColor = Color(0xFF000428);
  static const Color secondaryColor = Color(0xFFf7941d);
  static const Color darkText = Color(0xFF4A4A4A);
  static const Color subWhite = Color(0xFFD9D9D9);

  static const Color white = Color(0xFFFFFFFF);
  static const Color black = Color(0xFF000000);
  static const Color grey = Color(0xFF000000);

  //Text Theme
  static const Color lightText = Color(0xFF979797);
  static const Color darkerText = Color(0xFF17262A);
  static const Color blackText = Color(0xFF022424);

  static const LinearGradient primaryGradient = LinearGradient(
    colors: [
      Color(0xFF00B6E7),
      Color(0xFF0088C7),
      Color(0xFF003059),
    ],
  );

  static const LinearGradient secondaryGradient = LinearGradient(
    colors: [
      Color(0xFFFFB43D),
      Color(0xFFF68A29),
      Color(0xFFFF6701),
    ],
  );

  static const LinearGradient blueGradient = LinearGradient(
    colors: [
      Color(0xFF31AFEB),
      Color(0xFF2CC0D8),
      Color(0xFF26DABF),
    ],
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
  );

  static List<BoxShadow> boxShadow = [
    BoxShadow(
      color: Colors.black.withValues(alpha: 0.3),
      blurRadius: 5,
      offset: const Offset(0, 4),
    ),
  ];

  static List<BoxShadow> boxShadow2 = [
    BoxShadow(
      color: Colors.black.withValues(alpha: 0.3),
      blurRadius: 2,
      offset: const Offset(0, 2),
    ),
  ];

}

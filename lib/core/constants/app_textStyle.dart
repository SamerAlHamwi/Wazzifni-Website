import 'package:flutter/material.dart';

import 'appcolors.dart';


class AppText {
  AppText._();

  static double get  fontSizeExtraLarge=> 26.0;
  static double get  fontSizeLarge=> 18.0;
  static double get  fontSizeMedium => 16.0;
  static double get  fontSizeNormal => 14.0;
  static double get  fontSizeSmall => 10.0;

  static TextStyle get fontSizeExtraLargeTextStyle => TextStyle(
      color: AppColors.black,
      fontSize: AppText.fontSizeExtraLarge,
      fontWeight: FontWeight.bold,
      fontFamily: 'Tajawal',
      letterSpacing: 0.0);


  static TextStyle get fontSizeLargeTextStyle => TextStyle(
      color: AppColors.black,
      fontSize: AppText.fontSizeLarge,
      fontWeight: FontWeight.w400,
      fontFamily: 'Tajawal',
      letterSpacing: 0.0);

  static TextStyle get fontSizeMediumTextStyle => TextStyle(
      color: AppColors.black,
      fontSize: AppText.fontSizeMedium,
      fontWeight: FontWeight.w400,
      fontFamily: 'Tajawal',
      letterSpacing: 0.0);

  static TextStyle get fontSizeNormalTextStyle => TextStyle(
      color: AppColors.black,
      fontSize: AppText.fontSizeNormal,
      fontWeight: FontWeight.w400,
      fontFamily: 'Tajawal',
      letterSpacing: 0.0);

  static TextStyle get fontSizeSmallTextStyle => TextStyle(
      color: AppColors.black,
      fontSize: AppText.fontSizeSmall,
      fontWeight: FontWeight.w400,
      fontFamily: 'Tajawal',
      letterSpacing: 0.0);


}

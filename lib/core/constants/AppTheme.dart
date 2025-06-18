import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'appcolors.dart';


class AppTheme {
  static ThemeData theme = ThemeData(
    useMaterial3: false,
    scaffoldBackgroundColor: Colors.white,
    highlightColor: AppColors.primaryColor,
    primaryColor: AppColors.primaryColor,
    primaryColorDark: AppColors.primaryColor,
    primaryColorLight: AppColors.primaryColor,
    canvasColor: Colors.white,
    unselectedWidgetColor: Colors.grey,
    textTheme: textTheme,
    appBarTheme: appBarTheme,
    primaryTextTheme: textTheme,
    iconTheme: const IconThemeData(color: AppColors.primaryColor),
    primaryIconTheme: IconThemeData(color: AppColors.white, size: 5.0.r),
    elevatedButtonTheme: elevatedButtonThemeData(),
    textButtonTheme: textButtonThemeData(),
    visualDensity: VisualDensity.adaptivePlatformDensity,
  );

  static Color scaffoldBackgroundColor = AppColors.white;



  static TextButtonThemeData textButtonThemeData() {
    return TextButtonThemeData(
        style: ButtonStyle(
            padding: MaterialStateProperty.all<EdgeInsets>(const EdgeInsets.all(7)),
            foregroundColor:
                MaterialStateProperty.all<Color>(AppColors.primaryColor),
            textStyle: MaterialStateProperty.all<TextStyle>(subtitle2),
            // shape: MaterialStateProperty.all<RoundedRectangleBorder>(
            //     RoundedRectangleBorder(
            //         borderRadius: BorderRadius.circular(10.0),
            //         side: const BorderSide(color: AppColors.primaryColor)))
        )
    );
  }

  static ElevatedButtonThemeData elevatedButtonThemeData() {
    return ElevatedButtonThemeData(
        style: ButtonStyle(
            backgroundColor:
                MaterialStateProperty.all<Color>(AppColors.primaryColor),
            textStyle: MaterialStateProperty.all<TextStyle>(button),
            foregroundColor: MaterialStateProperty.all<Color>(Colors.white),
            elevation: MaterialStateProperty.all<double>(5),
            padding: MaterialStateProperty.all<EdgeInsets>(const EdgeInsets.all(15)),
            shape: MaterialStateProperty.all<RoundedRectangleBorder>(
                RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(5.0),
            ))));
  }

  static AppBarTheme appBarTheme = AppBarTheme(
      color: AppColors.white,
      titleTextStyle: headline3.copyWith(fontWeight: FontWeight.bold),
      elevation: .5,
      iconTheme: const IconThemeData(color: AppColors.blackText)
      );

  static TextTheme textTheme = TextTheme(
    displayLarge: headline1,
    displayMedium: headline2,
    displaySmall: headline3,
    headlineMedium: headline4,
    headlineSmall: headline5,
    titleLarge: headline6,
    titleMedium: subtitle1,
    titleSmall: subtitle2,
    bodyMedium: bodyText2,
    bodyLarge: bodyText1,
    labelLarge: button,
    bodySmall: caption,
    labelSmall: overLine,
  );
  static const String fontCairo = 'Cairo';

  static const String font = fontCairo;

  static TextStyle headline1 = const TextStyle(
    fontFamily: font,
    fontWeight: FontWeight.w700,
    fontSize: 20,
    letterSpacing: 0.4,
    // height: 1.9,
    color: AppColors.blackText,
  );

  static TextStyle headline2 = const TextStyle(
    fontFamily: font,
    fontWeight: FontWeight.w700,
    fontSize: 18,
    letterSpacing: 0.4,
    // height: 1.5,
    color: AppColors.blackText,
  );
  static TextStyle headline3 = const TextStyle(
    fontFamily: font,
    // fontWeight: FontWeight.w600,
    fontSize: 14,
    letterSpacing: 0.4,
    // height: 1.5,
    color: AppColors.blackText,
  );

  static TextStyle headline4 = const TextStyle(
    fontFamily: font,

    /// fontWeight: FontWeight.bold,
    fontSize: 12,
    letterSpacing: 0.4,
    // height: 1.5,
    color: AppColors.blackText,
  );

  static TextStyle headline5 = const TextStyle(
    fontFamily: font,
    //   fontWeight: FontWeight.bold,
    fontSize: 11,
    letterSpacing: 0.4,
    height: 0.9,
    color: AppColors.blackText,
  );

  //appbar title
  static TextStyle headline6 = const TextStyle(
    fontFamily: font,
    fontWeight: FontWeight.bold,
    fontSize: 16,
    letterSpacing: 0.18,
    color: AppColors.blackText,
  );

  static TextStyle subtitle1 = const TextStyle(
    fontFamily: AppTheme.font,
    height: 2,
    fontSize: 12,
    //letterSpacing: -0.04,
    color: AppColors.grey,
  );

  static TextStyle subtitle2 = const TextStyle(
    fontFamily: font,
    fontWeight: FontWeight.w600,
    fontSize: 12,
    letterSpacing: -0.04,
    color: AppColors.blackText,
  );

  //default Text
  static TextStyle bodyText2 = const TextStyle(
    fontFamily: font,
    fontWeight: FontWeight.w600,
    fontSize: 10,
//    letterSpacing: 0.2,
    color: AppColors.blackText,
  );

  static TextStyle bodyText1 = const TextStyle(
    fontFamily: font,
    fontWeight: FontWeight.w400,
    fontSize: 12,
    // letterSpacing: -0.05,
    color: AppColors.blackText,
  );

  //Validator Error message
  static TextStyle caption = const TextStyle(
    fontFamily: font,
    fontWeight: FontWeight.w400,
    fontSize: 8,
    letterSpacing: 0.2,
    color: AppColors.lightText, // was lightText
  );

  static TextStyle overLine = TextStyle(
    fontFamily: font,
    fontWeight: FontWeight.bold,
    fontSize: 6.0,
    letterSpacing: 0.4,
    height: 0.9,
    color: AppColors.blackText.withOpacity(0.5),
  );

  static TextStyle button = const TextStyle(
    fontFamily: font,
    fontWeight: FontWeight.w500,
    fontSize: 12,
    letterSpacing: 0.4,
    height: 0.9,
    color: AppColors.white,
  );
}

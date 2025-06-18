


import 'dart:io';
import 'dart:ui';
import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:google_fonts/google_fonts.dart';
import 'features/home/root_screen.dart';


class MyHttpOverrides extends HttpOverrides {
  @override
  HttpClient createHttpClient(SecurityContext? context) {
    return super.createHttpClient(context)
      ..badCertificateCallback =
          (X509Certificate cert, String host, int port) => true;
  }
}

class MyCustomScrollBehavior extends MaterialScrollBehavior {
  @override
  Set<PointerDeviceKind> get dragDevices =>
      {
        PointerDeviceKind.touch,
        PointerDeviceKind.mouse,
      };
}


void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await EasyLocalization.ensureInitialized();

  runApp(
    EasyLocalization(
      supportedLocales: const [Locale('ar'), Locale('en')],
      path: 'assets/lang',
      fallbackLocale: const Locale('ar'),
      startLocale: const Locale('ar'),
      child: ScreenUtilInit(
        designSize: const Size(100, 100),
        minTextAdapt: true,
        splitScreenMode: true,
        builder: (context, child) => const MyApp(),
      ),
    ),
  );
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'وظفني Wazzifni',
      debugShowCheckedModeBanner: false,
      localizationsDelegates: context.localizationDelegates,
      supportedLocales: context.supportedLocales,
      locale: context.locale,
      theme: ThemeData(
        useMaterial3: false,
        textTheme: GoogleFonts.ibmPlexSansArabicTextTheme(),
        primaryColor: const Color(0xFF004e92),
        scaffoldBackgroundColor: Colors.white,
      ),
      home: const RootScreen(),
    );
  }
}




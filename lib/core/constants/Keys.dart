import 'package:flutter/material.dart';

class Keys {
  static final GlobalKey<NavigatorState> navigatorKey =
      GlobalKey<NavigatorState>();

  static GlobalKey<ScaffoldState>? scaffoldKey;

  static final subScaffoldKey = GlobalKey<ScaffoldState>(debugLabel: 'test');


}

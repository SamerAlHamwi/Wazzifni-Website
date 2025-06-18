

import 'package:flutter/material.dart';
import 'package:wazzifni_website/features/home/ui/home_screen.dart';
import 'package:wazzifni_website/features/home/ui/widgets/drawer_widget.dart';
import 'package:wazzifni_website/features/home/ui/widgets/top_widget.dart';
import '../privacy_screen/ui/privacy_screen.dart';
import '../terms_screen/ui/terms_screen.dart';

class RootScreen extends StatefulWidget {
  const RootScreen({super.key});

  @override
  State<RootScreen> createState() => _RootScreenState();
}

class _RootScreenState extends State<RootScreen> {
  int activeTap = 0;

  final List<Widget> pages = const [
    HomePage(),
    PrivacyPolicyPage(),
    TermsAndConditionsPage(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      drawer: AppDrawer(
        onNavTap: (index) {
          Navigator.pop(context);
          setState(() {
            activeTap = index;
          });
        },
      ),
      body: Column(
        children: [
          TopWidget(
            onChangeTap: (index) {
              setState(() {
                activeTap = index;
              });
            },
          ),
          Expanded(child: pages[activeTap]),
        ],
      ),
    );
  }
}

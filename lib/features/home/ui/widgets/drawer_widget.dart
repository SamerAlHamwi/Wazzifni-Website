

import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:wazzifni_website/features/home/ui/widgets/top_widget.dart';
import 'language_switcher.dart';
import 'nav_item_widget.dart';

class AppDrawer extends StatefulWidget {

  final Function(int index) onNavTap;

  const AppDrawer({super.key, required this.onNavTap});

  @override
  State<AppDrawer> createState() => _AppDrawerState();
}

class _AppDrawerState extends State<AppDrawer> {

  @override
  Widget build(BuildContext context) {
    return Drawer(
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 40, horizontal: 16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                LanguageSwitcher(),
              ],
            ),
            const SizedBox(height: 20,),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Image.asset('assets/images/logo.png', height: 100,width: 100,),
              ],
            ),
            const SizedBox(height: 30,),
            NavItem(title: 'home'.tr(), onTap: () => widget.onNavTap(0)),
            const SizedBox(height: 10,),
            NavItem(title: 'privacy_policy'.tr(), onTap: () => widget.onNavTap(1)),
            const SizedBox(height: 10,),
            NavItem(title: 'terms'.tr(), onTap: () => widget.onNavTap(2)),
          ],
        ),
      ),
    );
  }
}

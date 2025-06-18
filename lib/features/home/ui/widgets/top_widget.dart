

import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'language_switcher.dart';
import 'nav_item_widget.dart';


class TopWidget extends StatelessWidget {
  const TopWidget({super.key,required this.onChangeTap});

  final Function(int) onChangeTap;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        bool isDesktop = constraints.maxWidth >= 900;

        return isDesktop
            ? DesktopTopBar(onNavTap: (index){ onChangeTap(index); })
            : const MobileTopBar();
      },
    );
  }
}


class DesktopTopBar extends StatelessWidget {
  final Function(int index) onNavTap;

  const DesktopTopBar({super.key, required this.onNavTap});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
      color: Colors.white,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              Image.asset('assets/images/logo.png', height: 40),
              const SizedBox(width: 40),
              NavItem(title: 'home'.tr(), onTap: () => onNavTap(0)),
              NavItem(title: 'privacy_policy'.tr(), onTap: () => onNavTap(1)),
              NavItem(title: 'terms'.tr(), onTap: () => onNavTap(2)),
            ],
          ),
          const LanguageSwitcher(),
        ],
      ),
    );
  }
}

class MobileTopBar extends StatelessWidget {
  const MobileTopBar({super.key});

  @override
  Widget build(BuildContext context) {
    return AppBar(
      backgroundColor: Colors.white,
      foregroundColor: Colors.black,
      elevation: 1,
      title: Padding(
        padding: const EdgeInsets.symmetric(vertical: 24.0),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.end,
          children: [
            Image.asset('assets/images/logo.png', height: 60,width: 60,),
          ],
        ),
      ),
    );
  }
}


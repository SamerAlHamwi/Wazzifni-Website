

import 'package:flutter/material.dart';

import '../../../../core/constants/appcolors.dart';


class NavItem extends StatefulWidget {
  final String title;
  final VoidCallback onTap;

  const NavItem({super.key, required this.title, required this.onTap});

  @override
  State<NavItem> createState() => _NavItemState();
}

class _NavItemState extends State<NavItem> {
  bool _isHovering = false;

  @override
  Widget build(BuildContext context) {
    return MouseRegion(
      onEnter: (_) => setState(() => _isHovering = true),
      onExit: (_) => setState(() => _isHovering = false),
      cursor: SystemMouseCursors.click,
      child: GestureDetector(
        onTap: widget.onTap,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 14.0, vertical: 8),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                widget.title,
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                  color: AppColors.black,
                  decoration: _isHovering ? TextDecoration.underline : TextDecoration.none,
                  decorationThickness: 2,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}



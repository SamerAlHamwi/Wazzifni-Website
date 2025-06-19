

import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';


class Footer extends StatelessWidget {
  const Footer({super.key,required this.onChangeTap});

  final Function(int) onChangeTap;

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.grey.shade200,
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 32),
      child: Column(
        children: [
          // const Text("© 2025 جميع الحقوق محفوظة – وظفني / بوابة التوظيف"),
          // const SizedBox(height: 12),
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextButton(
                onPressed: () {
                  onChangeTap(1);
                },
                child: Text(
                  "privacy_policy".tr(),
                  style: TextStyle(color: Colors.grey.shade600),
                ),
              ),
              Text(
                "|",
                style: TextStyle(color: Colors.grey.shade600),
              ),
              TextButton(
                onPressed: () {
                  onChangeTap(2);
                },
                child: Text(
                  "terms".tr(),
                  style: TextStyle(color: Colors.grey.shade600),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
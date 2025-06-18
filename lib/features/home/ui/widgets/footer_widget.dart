

import 'package:flutter/material.dart';


class Footer extends StatelessWidget {
  const Footer({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.grey.shade200,
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 32),
      child: Column(
        children: [
          const Text("© 2025 جميع الحقوق محفوظة – وظفني / بوابة التوظيف"),
          // const SizedBox(height: 12),
          // Text("سياسة الخصوصية | الشروط والأحكام",
          //     style: TextStyle(color: Colors.grey.shade600)),
        ],
      ),
    );
  }
}
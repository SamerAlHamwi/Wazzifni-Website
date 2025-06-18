

import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';


class AboutAppSection extends StatelessWidget {
  const AboutAppSection({super.key});

  @override
  Widget build(BuildContext context) {
    final isMobile = MediaQuery.of(context).size.width < 600;

    Widget imageStack = SizedBox(
      width: 360,
      height: 290,
      child: Stack(
        alignment: Alignment.center,
        children: [
          Positioned(
            top: 0,
            left: 0,
            child: Image.asset(
              'assets/images/mobile1.png',
              fit: BoxFit.cover,
              width: 360,
            ),
          ),

        ],
      ),
    );

    return Container(
      padding: const EdgeInsets.symmetric(vertical: 48, horizontal: 24),
      child: isMobile
          ? Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          imageStack,
          const SizedBox(height: 24),

          const Text(
            "عن التطبيق",
            style: TextStyle(fontSize: 26, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 16),
          const Text(
            "وظفني هو تطبيق توظيف رقمي ذكي يربط الباحثين عن العمل بأصحاب الشركات بشكل مباشر وفعّال داخل العراق. يوفر واجهة استخدام سهلة تتيح إنشاء ملفات احترافية وتقديم سريع على الوظائف، مع التركيز على احتياجات سوق العمل المحلي.",
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 16),
          ),
        ],
      )
          : Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          // Text on the left
          Expanded(
            flex: 3,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  "about_app_title".tr(),
                  style: const TextStyle(
                      fontSize: 26, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 16),
                Text(
                  "about_app_description".tr(),
                  style: const TextStyle(fontSize: 16),
                ),
              ],
            ),
          ),
          const SizedBox(width: 32),
          // Stacked images on the right
          imageStack,
        ],
      ),
    );
  }
}

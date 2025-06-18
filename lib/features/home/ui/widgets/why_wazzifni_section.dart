

import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:wazzifni_website/core/constants/appcolors.dart';

class WhyWazzifniSection extends StatelessWidget {
  const WhyWazzifniSection({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.symmetric(vertical: 32, horizontal: 24),
      child: Column(
        children: [
          Text("why_wazzifni".tr(),
              style: const TextStyle(fontSize: 26, fontWeight: FontWeight.bold, color: Colors.black87)),
          const SizedBox(height: 12),
          Wrap(
            alignment: WrapAlignment.center,
            runAlignment: WrapAlignment.center,
            crossAxisAlignment: WrapCrossAlignment.center,
            children: [
              FeatureCard(icon: 'assets/icons/flash.png', title: "easy_use".tr()),
              FeatureCard(icon: 'assets/icons/updated.png', title: "updated_jobs".tr()),
              FeatureCard(icon: 'assets/icons/location.png', title: "for_iraq".tr()),
            ],
          )
        ],
      ),
    );
  }
}


class FeatureCard extends StatelessWidget {
  final String icon;
  final String title;

  const FeatureCard({super.key, required this.icon, required this.title});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 160,
      height: 160,
      padding: const EdgeInsets.symmetric(horizontal: 16),
      margin: const EdgeInsets.symmetric(horizontal: 8,vertical: 8),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        boxShadow: AppColors.boxShadow,
        color: AppColors.white,
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Image.asset(icon, height: 40,width: 40,),
          const SizedBox(height: 12),
          Text(title, textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }
}

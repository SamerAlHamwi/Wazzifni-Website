import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import '../../../../core/constants/appcolors.dart';
import 'dart:html' as html;


class WazzifniWidget extends StatelessWidget {
  const WazzifniWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 32, horizontal: 24),
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [Color(0xFF004e92), Color(0xFF000428)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Image.asset('assets/images/app-logo.png', height: 100),
          const SizedBox(height: 24),
          Text("start_wazzifni".tr(),
              style: const TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                  color: Colors.white)),
          const SizedBox(height: 12),
          Text("today_job".tr(),
              style: const TextStyle(fontSize: 18, color: Colors.white70)),
          const SizedBox(height: 32),
          Wrap(
            spacing: 12,
            runSpacing: 12,
            alignment: WrapAlignment.center,
            children: [
              InkWell(
                onTap: () => html.window.open(
                  'https://play.google.com/store/apps/details?id=com.wazzifni.iraq&pcampaignid=web_share',
                  '_blank',
                ),
                child: Container(
                  width: 165,
                  padding:
                      const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(6),
                    color: AppColors.white,
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Text(
                          "Google Play",
                        style: TextStyle(fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(
                        width: 12,
                      ),
                      Image.asset(
                        'assets/icons/google-play.png',
                        height: 30,
                        width: 30,
                      ),
                    ],
                  ),
                ),
              ),
              InkWell(
                onTap: () => html.window.open(
                  'https://apps.apple.com/ae/app/%D8%A8%D9%88%D8%A7%D8%A8%D8%A9-%D9%88%D8%B8%D9%81%D9%86%D9%8A/id6743117085',
                  '_blank',
                ),
                child: Container(
                  width: 165,
                  padding:
                      const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(6),
                    color: AppColors.white,
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Text(
                          "App Store",
                        style: TextStyle(fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(
                        width: 12,
                      ),
                      Image.asset(
                        'assets/icons/app-store.png',
                        height: 30,
                        width: 30,
                      ),
                    ],
                  ),
                ),
              ),
            ],
          )
        ],
      ),
    );
  }
}


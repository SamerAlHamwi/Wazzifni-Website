

import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'dart:ui';
import '../../../core/constants/appcolors.dart';


class PrivacyPolicyPage extends StatelessWidget {

  const PrivacyPolicyPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [AppColors.primaryColor, AppColors.darkPrimaryColor],
          begin: Alignment.topRight,
          end: Alignment.bottomLeft,
        ),
      ),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 1000),
          child: ListView(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 40),
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    'privacy_policy'.tr(),
                    style: GoogleFonts.ibmPlexSansArabic(
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20,),
              buildGlassCard(
                icon: Icons.info_outline,
                title: 'privacy_intro'.tr(),
                text: 'privacy_intro_text'.tr(),
              ),
              buildGlassCard(
                icon: Icons.article,
                title: 'privacy_definitions'.tr(),
                text: 'privacy_definitions_text'.tr(),
              ),
              buildGlassCard(
                icon: Icons.security,
                title: 'privacy_data_collection'.tr(),
                text: 'privacy_data_collection_text'.tr()
              ),
              buildGlassCard(
                icon: Icons.track_changes,
                title: 'privacy_data_usage'.tr(),
                text: 'privacy_data_usage_text'.tr(),
              ),
              buildGlassCard(
                icon: Icons.share,
                title: 'privacy_data_sharing'.tr(),
                text: 'privacy_data_sharing_text'.tr(),
              ),
              buildGlassCard(
                icon: Icons.shield,
                title: 'privacy_data_protection'.tr(),
                text: 'privacy_data_protection_text'.tr()
              ),
              buildGlassCard(
                icon: Icons.verified_user,
                title: 'privacy_user_rights'.tr(),
                text: 'privacy_user_rights_text'.tr()
              ),
              buildGlassCard(
                icon: Icons.cookie,
                title: 'privacy_cookies'.tr(),
                text: 'privacy_cookies_text'.tr()
              ),
              buildGlassCard(
                icon: Icons.update,
                title: 'privacy_modifications'.tr(),
                text: 'privacy_modifications_text'.tr()
              ),
              buildGlassCard(
                icon: Icons.gavel,
                title: 'privacy_law'.tr(),
                text: 'privacy_law_text'.tr()
              ),
              const SizedBox(height: 24),
              Center(
                child: Text(
                  '© 2025 جميع الحقوق محفوظة – وظفني',
                  style: GoogleFonts.ibmPlexSansArabic(
                    fontSize: 14,
                    color: Colors.white70,
                  ),
                ),
              )
            ],
          ),
        ),
      ),
    );
  }

  Widget buildGlassCard({required IconData icon, required String title, required String text}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12.0),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(20),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
          child: Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: Colors.white24),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(icon, color: Colors.white, size: 22),
                    const SizedBox(width: 12),
                    Text(
                      title,
                      style: GoogleFonts.ibmPlexSansArabic(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Text(
                  text,
                  style: GoogleFonts.ibmPlexSansArabic(
                    fontSize: 15,
                    height: 1.7,
                    color: Colors.white.withValues(alpha: 0.95),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}



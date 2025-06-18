

import 'dart:ui';
import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:wazzifni_website/core/constants/appcolors.dart';

class TermsAndConditionsPage extends StatelessWidget {

  const TermsAndConditionsPage({super.key});

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
                    'terms'.tr(),
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
                title: 'terms_acceptance'.tr(),
                text: 'terms_acceptance_text'.tr(),
              ),
              buildGlassCard(
                icon: Icons.verified_user,
                title: 'terms_eligibility'.tr(),
                text: 'terms_eligibility_text'.tr()
              ),
              buildGlassCard(
                icon: Icons.person_add_alt_1,
                title: 'terms_account_creation'.tr(),
                text: 'terms_account_creation_text'.tr()
              ),
              buildGlassCard(
                icon: Icons.rule,
                title: 'terms_allowed_usage'.tr(),
                text: 'terms_allowed_usage_text'.tr()
              ),
              buildGlassCard(
                icon: Icons.copyright,
                title: 'terms_ip_rights'.tr(),
                text: 'terms_ip_rights_text'.tr()
              ),
              buildGlassCard(
                icon: Icons.cancel_schedule_send,
                title: 'terms_termination'.tr(),
                text: 'terms_termination_text'.tr(),
              ),
              buildGlassCard(
                icon: Icons.update,
                title: 'terms_modifications'.tr(),
                text: 'terms_modifications_text'.tr()
              ),
              buildGlassCard(
                icon: Icons.gavel,
                title: 'terms_law'.tr(),
                text: 'terms_law_text'.tr()
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

  Widget buildGlassCard({
    required IconData icon,
    required String title,
    required String text,
  }) {
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

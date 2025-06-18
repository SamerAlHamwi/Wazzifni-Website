import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:wazzifni_website/core/constants/appcolors.dart';

class ContactSection extends StatelessWidget {
  const ContactSection({super.key});

  @override
  Widget build(BuildContext context) {

    return Container(
      color: Colors.grey.shade100,
      padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Text(
            "contact_info_title".tr(),
            style: const TextStyle(
              fontSize: 32,
              fontWeight: FontWeight.bold,
              color: AppColors.primaryColor,
              letterSpacing: 1.2,
            ),
          ),
          const SizedBox(height: 16,),
          _ContactCard(
            icon: Icons.email,
            label: "contact_email_label".tr(),
            content: "contact_email_value".tr(),
          ),
          _ContactCard(
            icon: Icons.phone,
            label: "contact_phone_label".tr(),
            content: "contact_phone_value".tr(),
          ),
          _ContactCard(
            icon: Icons.location_on,
            label: "contact_address_label".tr(),
            content: "contact_address_value".tr(),
          ),

        ],
      ),
    );
  }
}

class _ContactCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final String content;

  const _ContactCard({
    required this.icon,
    required this.label,
    required this.content,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 4,
      shadowColor: AppColors.primaryColor.withValues(alpha: 0.3),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 24),
        child: Row(
          children: [
            CircleAvatar(
              backgroundColor: AppColors.primaryColor.withValues(alpha: 0.15),
              radius: 26,
              child: Icon(
                icon,
                size: 28,
                color: AppColors.primaryColor,
              ),
            ),
            const SizedBox(width: 24),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    label,
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: AppColors.primaryColor.withValues(alpha: 0.8),
                      letterSpacing: 0.8,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    content,
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                      color: Colors.black87,
                    ),
                  ),
                ],
              ),
            )
          ],
        ),
      ),
    );
  }
}

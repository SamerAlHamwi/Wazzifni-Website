

import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';

class TrainingServicesSection extends StatelessWidget {
  const TrainingServicesSection({super.key});

  @override
  Widget build(BuildContext context) {
    final services = [
      {
        'icon': Icons.school,
        'text': "service_1".tr(),
      },
      {
        'icon': Icons.trending_up,
        'text': "service_2".tr(),
      },
      {
        'icon': Icons.star,
        'text': "service_3".tr(),
      },
    ];


    final screenWidth = MediaQuery.of(context).size.width;
    final isMobile = screenWidth < 700;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 48, horizontal: 16),
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [Color(0xFFFDEBCD), Color(0xFFF7C77E)],
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
        ),
      ),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 1000),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Text(
                "training_services_title".tr(),
                style: const TextStyle(
                  fontSize: 30,
                  fontWeight: FontWeight.bold,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 32),

              // Responsive image + description layout
              Flex(
                direction: isMobile ? Axis.vertical : Axis.horizontal,
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(16),
                    child: Image.asset(
                      'assets/images/image1.jpg',
                      width: isMobile ? screenWidth * 0.8 : 350,
                      height: isMobile ? 200 : 250,
                      fit: BoxFit.cover,
                    ),
                  ),
                  const SizedBox(width: 24, height: 24),
                  SizedBox(
                    width: isMobile ? screenWidth * 0.8 : 400,
                    child: Padding(
                      padding: const EdgeInsets.all(12),
                      child: Text(
                        "training_description".tr(),
                        style: const TextStyle(fontSize: 18),
                        textAlign: TextAlign.center,
                      ),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 32),

              // Service feature cards
              Wrap(
                spacing: 16,
                runSpacing: 16,
                alignment: WrapAlignment.center,
                children: services.map((service) {
                  return Container(
                    width: isMobile ? screenWidth * 0.8 : 250,
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.95),
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: const [
                        BoxShadow(
                          color: Colors.black12,
                          blurRadius: 10,
                          offset: Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(service['icon'] as IconData,
                            size: 40, color: Colors.orange),
                        const SizedBox(height: 12),
                        Text(
                          service['text'] as String,
                          textAlign: TextAlign.center,
                          style: const TextStyle(fontSize: 16),
                        ),
                      ],
                    ),
                  );
                }).toList(),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

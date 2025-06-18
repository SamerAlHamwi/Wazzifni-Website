

import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';

class HowItWorksSection extends StatelessWidget {
  const HowItWorksSection({super.key});

  @override
  Widget build(BuildContext context) {
    final steps = [
      'step_1'.tr(),
      'step_2'.tr(),
      'step_3'.tr(),
      'step_4'.tr(),
    ];

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 48, horizontal: 24),
      color: Colors.grey.shade50,
      child: Column(
        children: [
          Text("how_works".tr(),
              style: const TextStyle(fontSize: 26, fontWeight: FontWeight.bold)),
          const SizedBox(height: 24),
          Wrap(
            spacing: 24,
            runSpacing: 24,
            children: List.generate(
              steps.length,
                  (i) => CircleStepWidget(number: i + 1, label: steps[i]),
            ),
          )
        ],
      ),
    );
  }
}

class CircleStepWidget extends StatelessWidget {
  final int number;
  final String label;

  const CircleStepWidget({super.key, required this.number, required this.label});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 120,
      child: Column(
        children: [
          CircleAvatar(
            radius: 32,
            backgroundColor: const Color(0xFFf7941d),
            child: Text('$number',
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 24, color: Colors.white, fontWeight: FontWeight.bold)),
          ),
          const SizedBox(height: 12),
          Text(label, textAlign: TextAlign.center, style: const TextStyle(fontSize: 16))
        ],
      ),
    );
  }
}



import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';


class AboutCompanySection extends StatelessWidget {
  const AboutCompanySection({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.blueGrey.shade50,
      padding: const EdgeInsets.symmetric(vertical: 48, horizontal: 24),
      child: Column(
        children: [
          Text("about_developer_title".tr(),
              style: const TextStyle(fontSize: 26, fontWeight: FontWeight.bold)),
          const SizedBox(height: 16),
          Text(
            "about_developer_description".tr(),
            textAlign: TextAlign.center,
            style: const TextStyle(fontSize: 16),
          )
        ],
      ),
    );
  }
}

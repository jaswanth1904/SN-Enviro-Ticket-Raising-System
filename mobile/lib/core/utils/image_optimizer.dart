import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:flutter_image_compress/flutter_image_compress.dart';
import 'package:path_provider/path_provider.dart';

class ImageOptimizer {
  /// Compresses the image in a background isolate to prevent UI thread blocking
  static Future<File?> compressImage(File file) async {
    // We use compute to run the heavy compression task in an Isolate
    final optimizedPath = await compute(_compressTask, file.absolute.path);
    if (optimizedPath != null) {
      return File(optimizedPath);
    }
    return null;
  }

  static Future<String?> _compressTask(String path) async {
    try {
      final lastIndex = path.lastIndexOf(new RegExp(r'.jp|.png|.jpeg'));
      final splitted = path.substring(0, (lastIndex));
      final outPath = '${splitted}_optimized.jpg';

      final result = await FlutterImageCompress.compressAndGetFile(
        path, 
        outPath,
        quality: 80,
        minWidth: 1920,
        minHeight: 1080,
      );
      
      return result?.path;
    } catch (e) {
      print('Compression Error: $e');
      return path; // Fallback to original if compression fails
    }
  }
}

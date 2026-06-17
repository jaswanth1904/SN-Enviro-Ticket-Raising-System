import 'package:hive_ce/hive.dart';
import 'package:hive_ce_flutter/hive_ce_flutter.dart';
import 'package:path_provider/path_provider.dart';
import 'package:flutter/foundation.dart';

class LocalStorage {
  static const String ticketBoxName = 'offline_tickets';

  static Future<void> init() async {
    if (!kIsWeb) {
      final dir = await getApplicationDocumentsDirectory();
      Hive.init(dir.path);
    } else {
      await Hive.initFlutter();
    }
    await Hive.openBox<Map<dynamic, dynamic>>(ticketBoxName);
  }

  Box<Map<dynamic, dynamic>> get ticketBox => Hive.box<Map<dynamic, dynamic>>(ticketBoxName);

  Future<void> saveOfflineTicket(Map<String, dynamic> ticketData) async {
    await ticketBox.add(ticketData);
  }

  List<Map<dynamic, dynamic>> getOfflineTickets() {
    return ticketBox.values.toList();
  }

  Future<void> clearOfflineTickets() async {
    await ticketBox.clear();
  }
  
  Future<void> deleteTicket(int index) async {
    await ticketBox.deleteAt(index);
  }
}

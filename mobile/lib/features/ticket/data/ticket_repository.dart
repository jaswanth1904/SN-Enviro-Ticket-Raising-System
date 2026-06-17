import 'package:dio/dio.dart';
import '../../../core/network/api_client.dart';
import '../../../core/network/network_info.dart';
import '../../../core/storage/local_storage.dart';
import '../domain/ticket_model.dart';

class TicketRepository {
  final ApiClient apiClient;
  final NetworkInfo networkInfo;
  final LocalStorage localStorage;

  TicketRepository({
    required this.apiClient,
    required this.networkInfo,
    required this.localStorage,
  });

  /// Submits ticket to API if online, otherwise saves to Hive
  Future<bool> submitTicket(TicketModel ticket) async {
    final bool isOnline = await networkInfo.isConnected;

    if (isOnline) {
      try {
        final Map<String, dynamic> data = {
          'stationId': ticket.stationId,
          'subject': ticket.subject,
          'description': ticket.description,
          if (ticket.latitude != null) 'latitude': ticket.latitude,
          if (ticket.longitude != null) 'longitude': ticket.longitude,
        };

        final response = await apiClient.dio.post('/tickets', data: data);
        return response.statusCode == 201;
      } catch (e) {
        // If the server crashes with a 500 or timeout, fallback to offline storage
        print('API Error during ticket submission: $e. Falling back to offline queue.');
        await _saveOffline(ticket);
        return false; // Indicates it was saved offline instead of immediate success
      }
    } else {
      // Force offline save
      await _saveOffline(ticket);
      return false; // Indicates offline draft
    }
  }

  Future<void> _saveOffline(TicketModel ticket) async {
    final draftTicket = TicketModel(
      stationId: ticket.stationId,
      subject: ticket.subject,
      description: ticket.description,
      localImagePath: ticket.localImagePath,
      latitude: ticket.latitude,
      longitude: ticket.longitude,
      isOfflineDraft: true,
    );
    await localStorage.saveOfflineTicket(draftTicket.toJson());
  }

  /// Called by SyncDaemon to flush queue
  Future<int> syncOfflineTickets() async {
    final bool isOnline = await networkInfo.isConnected;
    if (!isOnline) return 0;

    final offlineTickets = localStorage.getOfflineTickets();
    if (offlineTickets.isEmpty) return 0;

    int syncedCount = 0;

    for (int i = 0; i < offlineTickets.length; i++) {
      final t = TicketModel.fromJson(offlineTickets[i]);
      try {
        final Map<String, dynamic> data = {
          'stationId': t.stationId,
          'subject': t.subject,
          'description': t.description,
        };

        final response = await apiClient.dio.post('/tickets', data: data);
        if (response.statusCode == 201) {
          await localStorage.deleteTicket(i);
          syncedCount++;
        }
      } catch (e) {
        // Skip on error, keep in queue
        print('Sync failed for ticket index $i: $e');
      }
    }

    return syncedCount;
  }
}

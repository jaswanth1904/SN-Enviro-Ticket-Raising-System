import 'dart:async';
import '../../../core/network/network_info.dart';
import '../ticket/data/ticket_repository.dart';

class SyncDaemon {
  final NetworkInfo networkInfo;
  final TicketRepository ticketRepository;
  StreamSubscription? _subscription;

  SyncDaemon({required this.networkInfo, required this.ticketRepository});

  void start() {
    _subscription = networkInfo.onConnectivityChanged.listen((result) async {
      // Whenever network status changes, attempt to flush queue
      final isOnline = await networkInfo.isConnected;
      if (isOnline) {
        print('SyncDaemon: Network detected. Attempting to flush offline tickets...');
        final syncedCount = await ticketRepository.syncOfflineTickets();
        if (syncedCount > 0) {
          print('SyncDaemon: Successfully pushed $syncedCount tickets to backend.');
        } else {
          print('SyncDaemon: No offline tickets to sync.');
        }
      }
    });
  }

  void stop() {
    _subscription?.cancel();
  }
}

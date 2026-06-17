import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:connectivity_plus/connectivity_plus.dart';

import 'core/theme/app_theme.dart';
import 'core/network/api_client.dart';
import 'core/network/network_info.dart';
import 'core/storage/local_storage.dart';

import 'features/auth/bloc/auth_bloc.dart';
import 'features/auth/presentation/login_page.dart';

import 'features/ticket/data/ticket_repository.dart';
import 'features/ticket/bloc/ticket_bloc.dart';
import 'features/ticket/presentation/ticket_form_page.dart';

import 'features/sync/sync_daemon.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize Hive CE
  await LocalStorage.init();

  // Core DI
  const secureStorage = FlutterSecureStorage();
  final apiClient = ApiClient(secureStorage: secureStorage);
  final networkInfo = NetworkInfoImpl(Connectivity());
  final localStorage = LocalStorage();

  final ticketRepo = TicketRepository(
    apiClient: apiClient,
    networkInfo: networkInfo,
    localStorage: localStorage,
  );

  // Initialize Background Sync
  final syncDaemon = SyncDaemon(networkInfo: networkInfo, ticketRepository: ticketRepo);
  syncDaemon.start();

  runApp(MyApp(
    apiClient: apiClient,
    secureStorage: secureStorage,
    ticketRepository: ticketRepo,
  ));
}

class MyApp extends StatelessWidget {
  final ApiClient apiClient;
  final FlutterSecureStorage secureStorage;
  final TicketRepository ticketRepository;

  const MyApp({
    super.key, 
    required this.apiClient, 
    required this.secureStorage, 
    required this.ticketRepository,
  });

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider(
          create: (_) => AuthBloc(apiClient: apiClient, secureStorage: secureStorage)..add(CheckAuthStatus()),
        ),
        BlocProvider(
          create: (_) => TicketBloc(repository: ticketRepository),
        ),
      ],
      child: MaterialApp(
        title: 'SN Enviro Mobile',
        theme: AppTheme.darkTheme,
        debugShowCheckedModeBanner: false,
        home: BlocBuilder<AuthBloc, AuthState>(
          builder: (context, state) {
            if (state is AuthAuthenticated) {
              return const TicketFormPage();
            }
            if (state is AuthLoading || state is AuthInitial) {
              return const Scaffold(body: Center(child: CircularProgressIndicator()));
            }
            return const LoginPage();
          },
        ),
      ),
    );
  }
}

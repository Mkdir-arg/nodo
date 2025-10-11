from django.core.management.base import BaseCommand
from django.db import transaction
from flows.models import Flujo
from flows.serializers import FlujoSerializer


class Command(BaseCommand):
    help = 'Migrate existing flows to use Step/Transition structure'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be migrated without making changes',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        
        flows_to_migrate = Flujo.objects.filter(
            flow_steps__isnull=True
        ).exclude(steps_data__isnull=True).exclude(steps_data=[])
        
        self.stdout.write(f"Found {flows_to_migrate.count()} flows to migrate")
        
        for flow in flows_to_migrate:
            self.stdout.write(f"Processing flow: {flow.name}")
            
            if dry_run:
                self.stdout.write(f"  Would migrate {len(flow.steps_data)} steps")
                continue
            
            try:
                with transaction.atomic():
                    serializer = FlujoSerializer()
                    serializer._sync_flow_structure(flow, flow.steps_data)
                    self.stdout.write(
                        self.style.SUCCESS(f"  ✓ Migrated {flow.name}")
                    )
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f"  ✗ Failed to migrate {flow.name}: {e}")
                )
        
        if dry_run:
            self.stdout.write("Dry run completed. Use without --dry-run to apply changes.")
        else:
            self.stdout.write("Migration completed.")
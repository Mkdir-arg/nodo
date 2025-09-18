from .models import InstanciaFlujo


class FlowRunner:
    """Basic flow runner implementation"""
    
    def __init__(self, instance):
        self.instance = instance
        
    def execute(self):
        """Execute the flow instance"""
        try:
            self.instance.status = 'running'
            self.instance.save()
            
            # Basic execution logic here
            # This would be expanded with actual step execution
            
            self.instance.status = 'completed'
            self.instance.save()
            
        except Exception as e:
            self.instance.status = 'failed'
            self.instance.error_message = str(e)
            self.instance.save()
            raise
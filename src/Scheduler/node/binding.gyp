{
	"targets": [
	{
		"target_name": "scheduler",
		"sources": ["../Scheduler.cpp", "Scheduler_node.cpp"],
		'cflags': [
			'-Wall',
			'-std=c++11',
        	'-stdlib=libc++'],
        'ldflags': [
        	'-stlid=libc++'],
	}
	]
}
